import {transformToCommaString, maybeStringToArray, maybeArrayToString, SlugFromStringArrayOrObject, maybeObjectToArray} from '../lib/utils.js';

import tagsObject from './fixtures/tags.json';

describe('Utils (transformToCommaString)', function () {
    test('can extract `name` values from object', function () {
        let tagNames = transformToCommaString(tagsObject, 'name');
        expect(tagNames).toEqual('Lorem Ipsum,Dolor Simet');
    });

    test('can extract `slug` values from object', function () {
        let tagSlugs = transformToCommaString(tagsObject, 'slug');
        expect(tagSlugs).toEqual('lorem-ipsum,dolor-simet');
    });

    test('can extract `url` values from object', function () {
        let tagURLs = transformToCommaString(tagsObject, 'url');
        expect(tagURLs).toEqual('http://localhost:2368/tag/lorem-ipsum/,http://localhost:2368/tag/dolor-simet/');
    });

    test('will not transform a string', function () {
        let tagNames = transformToCommaString('Lorem Ipsum,Dolor Simet');
        expect(tagNames).toEqual('Lorem Ipsum,Dolor Simet');
    });
});

describe('Utils (maybeObjectToArray)', function () {
    test('can extract `name` values from object', function () {
        let tagNames = maybeObjectToArray(tagsObject, 'name');
        expect(tagNames).toBeArrayOfSize(2);
        expect(tagNames[0]).toEqual('Lorem Ipsum');
        expect(tagNames[1]).toEqual('Dolor Simet');
    });

    test('can extract `slug` values from object', function () {
        let tagSlugs = maybeObjectToArray(tagsObject, 'slug');
        expect(tagSlugs).toBeArrayOfSize(2);
        expect(tagSlugs[0]).toEqual('lorem-ipsum');
        expect(tagSlugs[1]).toEqual('dolor-simet');
    });

    test('can extract `url` values from object', function () {
        let tagURLs = maybeObjectToArray(tagsObject, 'url');
        expect(tagURLs).toBeArrayOfSize(2);
        expect(tagURLs[0]).toEqual('http://localhost:2368/tag/lorem-ipsum/');
        expect(tagURLs[1]).toEqual('http://localhost:2368/tag/dolor-simet/');
    });
});

describe('Utils (maybeStringToArray)', function () {
    test('can convert comma-separated string to an array', function () {
        let stringToArray = maybeStringToArray('lorem-ipsum,  dolor-simet');
        expect(stringToArray).toBeArrayOfSize(2);
        expect(stringToArray[0]).toEqual('lorem-ipsum');
        expect(stringToArray[1]).toEqual('dolor-simet');
    });

    test('will not transform an array', function () {
        let stringToArray = maybeStringToArray(['lorem-ipsum', 'dolor-simet']);
        expect(stringToArray).toBeArrayOfSize(2);
        expect(stringToArray[0]).toEqual('lorem-ipsum');
        expect(stringToArray[1]).toEqual('dolor-simet');
    });
});

describe('Utils (maybeArrayToString)', function () {
    test('can convert an array to a comma-separated string', function () {
        let arrayToString = maybeArrayToString(['lorem-ipsum', 'dolor-simet']);
        expect(arrayToString).toEqual('lorem-ipsum,dolor-simet');
    });

    test('wil not convert string', function () {
        let arrayToString = maybeArrayToString('lorem-ipsum,dolor-simet');
        expect(arrayToString).toEqual('lorem-ipsum,dolor-simet');
    });
});

describe('Utils (SlugFromStringArrayOrObject)', function () {
    test('can convert an object to list array', function () {
        let tagSlugs = SlugFromStringArrayOrObject(tagsObject);
        expect(tagSlugs).toBeArrayOfSize(2);
        expect(tagSlugs[0]).toEqual('lorem-ipsum');
        expect(tagSlugs[1]).toEqual('dolor-simet');
    });

    test('can convert an string to list array', function () {
        let tagSlugs = SlugFromStringArrayOrObject('lorem-ipsum, dolor-simet');
        expect(tagSlugs).toBeArrayOfSize(2);
        expect(tagSlugs[0]).toEqual('lorem-ipsum');
        expect(tagSlugs[1]).toEqual('dolor-simet');
    });

    test('wil not convert list to list', function () {
        let tagSlugs = SlugFromStringArrayOrObject(['lorem-ipsum', 'dolor-simet']);
        expect(tagSlugs).toBeArrayOfSize(2);
        expect(tagSlugs[0]).toEqual('lorem-ipsum');
        expect(tagSlugs[1]).toEqual('dolor-simet');
    });
});
