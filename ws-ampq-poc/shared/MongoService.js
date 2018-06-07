const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

/**
 * This class is the decorator for the mongodb npm
 */
module.exports = class MongoDecorator {

    /**
     * Creates an instance of MongoDecorator.
     * @param {Object} configs 
     */
    constructor(configs) {
        this.url = 'mongodb://diogo_aleixo:dmaaac3@ds261969.mlab.com:61969/heroku_21f9wz06';    
        this.url = `mongodb://${configs.username}:${configs.pass}@${configs.host}:${configs.port}/${configs.database}`    
        this.database = configs.database;
    }

    /**
     * Insert in a given colection at a given database data
     * 
     * @example
     * 
     *  const statistics = {                        
            missingRows : 0,
            missingRowsPercentage: 100,
            each_probability : 0.000000013110394,
            total_combinations : 76275360
        }
     * 
     * this.mongoWrapper.insert(statistics, this.collections.statistics,this.database))
     * 
     * @param {Object} data - The data to be inserted
     * @param {string} collectionName - The collection name to insert the data
     * @param {string} database - The database name to insert the data
     * @returns {Promise} Resolve or reject the promise
     */
    insert(data, collectionName, database) {        
        return new Promise((resolve, reject) => {                                               
            return MongoClient.connect(this.url, (err, db) => {                                     
                if (err) {
                    throw err;
                }                   
                const dbo = db.db(database);            
                dbo.collection(collectionName).insert(data, (err, res) => {              
                    db.close();                                              
                    return err ? reject(err) : resolve('INSERTED');                         
                });
            });
        })
    } 
    
    /**
     * Insert in bulk in a given colection at a given database data
     * 
     * Used when the object is too large
     * 
     * @example
     * 
     *  const statistics = [{                        
            missingRows : 0,
            missingRowsPercentage: 100,
            each_probability : 0.000000013110394,
            total_combinations : 76275360
        }]
     * 
     * this.mongoWrapper.insertBulk(statistics, this.collections.statistics,this.database))
     * 
     * @param {Object} bulkData - The data to be inserted in form of an array.
     * @param {string} collectionName - The collection name to insertBulk the data
     * @param {string} database - The database name to insertBulk the data
     * @returns {Promise} Resolve or reject the promise
     */
    insertBulk(bulkData, collectionName, database) {
        return new Promise((resolve, reject) => {                                               
            MongoClient.connect(this.url, (err, db) => {                                     
                if (err) {
                    throw err;
                }    

                const dbo = db.db(this.database);            
                const batch = dbo.collection(collectionName).initializeOrderedBulkOp();
                bulkData.forEach( item => {
                    batch.insert(item);
                })
                batch.execute( (err, result) => {
                    db.close();                          
                    return err ? reject(err) : resolve('BULK INSERTED');                         
                })
            });
        })
    }

    /**
     * Remove all the collection docs
     * 
     * @example
     * this.mongoWrapper.removeCollectionDocs(this.collections.numbers, this.database)
     * 
     * @param {string} collectionName - The collection name to removed the data
     * @param {string} database - The database name to removed the data
     * @returns {Promise} Resolve or reject the promise
     */
    removeCollectionDocs(collectionName, database) {        
        return new Promise((resolve,reject) => {
            MongoClient.connect(this.url, (err, db) => {                                     
                if (err) {
                    throw err;
                }          

                const dbo = db.db(database);            
                dbo.collection(collectionName).remove({}, () => {                                    
                    return err ? reject(err) : resolve('REMOVED');                                         
                });
            });             
        })
    }   

    /**
     * Find data in a collection
     * 
     * @example
     * Retrieve all the data from the colection with {} as first argument
     * 
     * this.mongoWrapper.find({},this.collections.numbers,this.database)
     * 
     * @param {Object} data - The data to be found
     * @param {string} collectionName - The collection name to found the data
     * @param {string} database - The database name to found the data
     * @returns {Promise} Resolve or reject the promise
     */
    find(data, collectionName, database) {        
        return new Promise( (resolve, reject) => {
            MongoClient.connect(this.url, function(err, db) {
                if (err) {
                    throw err;
                }

                const dbo = db.db(database);
                dbo.collection(collectionName).find(data).toArray((err, result) => {                             
                    db.close();
                    return err ? reject(err) : resolve(result)                     
                });
            });             
        })
    }

    /**
     * Delete one document in a collection that matches a give query
     * 
     * @example
     * Retrieve all the data from the colection with {} as first argument
     * 
     * this.mongoWrapper.deleteOne({x:'y'},this.collections.numbers,this.database)
     * 
     * @param {Object} data - The query to match
     * @param {string} collectionName - The collection name to delete the data
     * @param {string} database - The database name to delete the data
     * @returns {Promise} Resolve or reject the promise
     */
    deleteOne(data, collectionName, database) {
        return new Promise( (resolve, reject) => {
            MongoClient.connect(this.url, function(err, db) {
                if (err) {
                    throw err;
                }
                
                const dbo = db.db(database);
                dbo.collection(collectionName).deleteOne(data, (err, result) => {                             
                    db.close();                    
                    return err ? reject(err) : resolve(result.deletedCount)                     
                });
            });             
        })
    }

    /**
     * Update one document in a collection that matches a give query
     * 
     * @example
     * Retrieve all the data from the colection with {} as first argument
     * 
     * return this.mongoWrapper.updateOne({
            missingRows : totalNumbers,  
            missingRowsPercentage : (totalNumbers * 100) / gotProb.total_combinations
        },{},this.collections.statistics,this.database)
     * 
     * @param {Object} data - The query to match
     * @param {string} collectionName - The collection name to updateOne the data
     * @param {string} database - The database name to updateOne the data
     * @returns {Promise} Resolve or reject the promise
     */
    updateOne(data, targetData, collectionName, database) {        
        return new Promise( (resolve, reject) => {
            MongoClient.connect(this.url, function(err, db) {
                if (err) {
                    throw err;
                }
                
                const dbo = db.db(database);
                const myquery = targetData;
                const newvalues = { $set: {...data} };                
                dbo.collection(collectionName).updateOne(myquery, newvalues, (err, result) => {                             
                    db.close();                    
                    return err ? reject(err) : resolve(result.deletedCount)                     
                });
            });             
        })
    }

    /**
     * Update one document in a collection that matches a give query unsetting the key.
     * Equivalent to deleting one row, but on the document.
     * 
     * @example     
     * 
     * this.mongoWrapper.updateUnset({[number] : number}, { [number] : number },
     * this.collections.numbers,this.database )
     * 
     * @param {Object} data - The data to  ($unset)
     * @param {Object} targetData - The data to match
     * @param {string} collectionName - The collection name to updateUnset the data
     * @param {string} database - The database name to updateUnset the data
     * @returns {Promise} Resolve or reject the promise
     */
    updateUnset(data, targetData, collectionName, database) {        
        return new Promise( (resolve, reject) => {
            MongoClient.connect(this.url, function(err, db) {
                if (err) {
                    throw err;
                }
                
                const dbo = db.db(database);
                const myquery = targetData;
                const newvalues = { $unset: {...data} };                
                dbo.collection(collectionName).updateOne(myquery, newvalues, (err, result) => {                             
                    db.close();                                        
                    return err ? reject(err) : resolve(result.matchedCount)                     
                });
            });             
        })
    }
}