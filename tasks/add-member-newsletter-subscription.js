import Promise from 'bluebird';
import _ from 'lodash';
import GhostAdminAPI from '@tryghost/admin-api';
import {makeTaskRunner} from '@tryghost/listr-smart-renderer';
import {discover} from '../lib/batch-ghost-discover.js';

const initialise = (options) => {
    return {
        title: 'Initialising API connection',
        task: (ctx, task) => {
            let defaults = {
                verbose: false,
                delayBetweenCalls: 50
            };

            const url = options.apiURL;
            const key = options.adminAPIKey;
            const api = new GhostAdminAPI({
                url,
                key,
                version: 'v5.0'
            });

            ctx.args = _.mergeWith(defaults, options);
            ctx.api = api;
            ctx.newsletters = [];
            ctx.users = [];
            ctx.updated = [];
            ctx.newsletterObj = null;

            task.output = `Initialised API connection for ${options.apiURL}`;
        }
    };
};

const getFullTaskList = (options) => {
    return [
        initialise(options),
        {
            title: 'Fetch Content from Ghost API',
            task: async (ctx, task) => {
                try {
                    ctx.newsletters = await discover({
                        api: ctx.api,
                        type: 'newsletters',
                        limit: 50
                    });
                } catch (error) {
                    ctx.errors.push(error);
                    throw error;
                }

                let thisNewsletterSlug;

                try {
                    const thisNewsletterObj = _.find(ctx.newsletters, {id: options.newsletterID});
                    ctx.newsletterObj = thisNewsletterObj;
                    thisNewsletterSlug = thisNewsletterObj.slug;
                } catch (error) {
                    error.message = `No newsletter found for ${options.newsletterID}`;
                    ctx.errors.push(error);
                    throw error;
                }

                let discoveryFilter = [];

                discoveryFilter.push(`newsletters:-[${thisNewsletterSlug}]`);

                if (options.onlyForLabelSlug) {
                    discoveryFilter.push(`label:[${options.onlyForLabelSlug}]`);
                }

                let discoveryOptions = {
                    api: ctx.api,
                    type: 'members',
                    filter: discoveryFilter.join('+')
                };

                try {
                    ctx.members = await discover(discoveryOptions);
                    task.output = `Found ${ctx.members.length} members`;
                } catch (error) {
                    ctx.errors.push(error);
                    throw error;
                }
            }
        },
        {
            title: 'Updating members from Ghost',
            task: async (ctx) => {
                let tasks = [];

                await Promise.mapSeries(ctx.members, async (member) => {
                    tasks.push({
                        title: `Updating ${member.email}`,
                        task: async () => {
                            let newMemberObject = {
                                id: member.id,
                                newsletters: member.newsletters
                            };

                            newMemberObject.newsletters.push(ctx.newsletterObj);

                            // console.log(newMemberObject);

                            try {
                                let result = await ctx.api.members.edit(newMemberObject);
                                ctx.updated.push(result);
                                return Promise.delay(options.delayBetweenCalls).return(result);
                            } catch (error) {
                                ctx.errors.push(error);
                                throw error;
                            }
                        }
                    });
                });

                let taskOptions = options;
                taskOptions.concurrent = 1;
                return makeTaskRunner(tasks, taskOptions);
            }
        }
    ];
};

const getTaskRunner = (options) => {
    let tasks = [];

    tasks = getFullTaskList(options);

    return makeTaskRunner(tasks, Object.assign({topLevel: true}, options));
};

export default {
    initialise,
    getFullTaskList,
    getTaskRunner
};
