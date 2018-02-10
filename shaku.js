'use strict';


const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});

const tableName = process.env.TABLE_NAME;

const createResponse = (statusCode, body) => {
    
    return {
        statusCode: statusCode,
        body: body
    }
};

exports.get = (event, context, callback) => {
    
    let params = {
        TableName: tableName,
        Key: {
            name: event.pathParameters.resourceId
        }
    };
    
    let dbGet = (params) => { return dynamo.get(params).promise() };
    
    dbGet(params).then( (data) => {
        if (!data.Item) {
            callback(null, createResponse(404, JSON.stringify({msg: "ITEM NOT FOUND"})));
            return;
        }
        console.log(`RETRIEVED ITEM SUCCESSFULLY WITH doc = ${data.Item}`);
        callback(null, createResponse(200, JSON.stringify(data.Item)));
    }).catch( (err) => { 
        console.log(`GET ITEM FAILED FOR doc = ${params.Key.id}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, {error: err}));
    });
};

exports.getAll = (event, context, callback) => {
    console.log('table', tableName)
    let params = {
        TableName: tableName,
    };
    
    let dbGet = (params) => { return dynamo.scan(params).promise() };
    
    dbGet(params).then( (data) => {
        if (!data) {
            callback(null, createResponse(404, JSON.stringify({msg: "RESOURCE NOT FOUND"})));
            return;
        }
        console.log(`RETRIEVED ITEM SUCCESSFULLY WITH doc = ${JSON.stringify(data)}`);
        callback(null, createResponse(200, JSON.stringify(data.Items)));
    }).catch( (err) => { 
        console.log(`GET ITEM FAILED FOR doc = ${params}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err));
    });
};

exports.put = (event, context, callback) => {
    


    let params = {
        TableName: tableName,
        Item: JSON.parse(event.body)
    };

    console.log('BODUY', JSON.stringify(params, null, 2));
    
    let dbPut = (params) => { return dynamo.put(params).promise() };
    
    dbPut(params).then( (data) => {
        console.log(`PUT ITEM SUCCEEDED WITH doc = ${params}`);
        callback(null, createResponse(200, null));
    }).catch( (err) => { 
        console.log(`PUT ITEM FAILED FOR doc = ${params}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err)); 
    });
};

exports.post = (event, context, callback) => {
    
    let item = {
        doc: JSON.parse(event.body)
    };

    let params = {
        TableName: tableName,
        Item: item.doc
    };
    console.log(params)
    let dbPost = (params) => { return dynamo.put(params).promise() };
    
    dbPost(params).then( (data) => {
        console.log(`PUT ITEM SUCCEEDED WITH doc = ${item.doc}`);
        callback(null, createResponse(200, null));
    }).catch( (err) => { 
        console.log(`PUT ITEM FAILED FOR doc = ${item.doc}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err)); 
    });
};

exports.delete = (event, context, callback) => {
    
    let params = {
        TableName: tableName,
        Key: {
            name: event.pathParameters.resourceId
        },
        ReturnValues: 'ALL_OLD'
    };
    console.log('DELETE', JSON.stringify(params))
    let dbDelete = (params) => { return dynamo.delete(params).promise() };
    
    dbDelete(params).then( (data) => {
        if (!data.Attributes) {
            callback(null, createResponse(404, "ITEM NOT FOUND FOR DELETION"));
            return;
        }
        console.log(`DELETED ITEM SUCCESSFULLY WITH id = ${event.pathParameters.resourceId}`);
        callback(null, createResponse(200, null));
    }).catch( (err) => { 
        console.log(`DELETE ITEM FAILED FOR id = ${event.pathParameters.resourceId}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err));
    });
};