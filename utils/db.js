// I was bored, okay?

const MongoClient = require('mongodb').MongoClient;
const execpath = process.cwd();
const { DB } = require(execpath + "/config.json");
const err_msg = require(execpath + "/utils/err_msg.js");
let util = require('util');
const moment = require('moment');
const fs = require('fs');

let client;
let db;
let DSCclient;

//db.createRole({role: "CompactRole", privileges: [{resource: {"db": "LabBot", collection: "LAB-lexicon"}, actions: ["compact"]},{resource: {"db": "LabBot", collection: "LAB-users"}, actions: ["compact"]},{resource: {"db": "LabBot", collection: "LAB-storage"}, actions: ["compact"]}], roles: []})
//db.grantRolesToUser("LabBot", ["CompactRole"])
//db.runCommand({compact: "LAB-lexicon"})

module.exports = {

    /** Connect to MondoDB database server
     * @param {String} uri     MongoDB connection string (loaded from config.json if not specified)
     * @param {String} dataset Target databse name (loaded from config.json if not specified)
     * @returns {boolean} True if successful
    */
    async init(DSC, uri = DB.uri, dataset = DB.dataset) {
        try {
            DSCclient = DSC;
            console.log(`[{}]Connecting to mongodb server...`);
            client = new MongoClient(uri);
            await client.connect();
            db = client.db(dataset);
            console.log("[i]Successfully connected to database server");
            return true;
        }
        catch (err) { console.error("[!]Unable to connect to database server! \n Error: ", err); await err_msg("Database initialization", err, DSCclient); return false; }
    },

    /** Close connection to MongoDB server
     * @returns {boolean} True if successful
    */
    async end() {
        try {
            console.log(`[{}]Attempting to disconnect from mongodb server...`);
            await client.close();
            console.log("[i]Disconnected from mongodb server");
            return true;
        }
        catch (err) { console.error("[!]Unable to disconnect from database! \n Error: ", err); err_msg("Database session close", err, DSCclient); return false; }
    },

    /** Create indexes on goven collection
     * @param {Object} index    MongoDB index object (loaded from config.json if not specified)
     * @param {String} collection   Target collection name
     * @returns {boolean} True if successful
     */
    async index(collectionName, index = DB.index, options) {
        try {
            console.log("[{}]Indexing database collection " + collectionName + "...\n  > index data: " + util.inspect(index, colors = true));
            if (options) console.log("  > unique: " + options.unique ? "true" : "false");
            await db.collection(collectionName).createIndex(index, options);
            console.log("[i]Collection indexing done");
            return true;
        }
        catch (err) { console.error("[!]Unable to index database collection! \n Error: ", err); err_msg("Database collection indexing", err, DSCclient); return false; }
    },

    /** Print database structure diagram to output log
     * @returns {string} graphical ASCII representation of database structure
     */
    async logStructure() {
        try {
            const databases = (await client.db().admin().listDatabases()).databases;

            console.log("\n#Database structure:\n-------------------------------------");
            let output = ``;
            for (const database of databases) {
                const dbName = database.name;
                const db_ = client.db(dbName);
                let collections = await db_.listCollections().toArray();

                output += `- ${dbName}`;

                if (collections.length > 0) for (let i in collections) {
                    let stats = await db_.collection(collections[i].name).stats();
                    output += `\n  > ${collections[i].name}\n   * ${stats.count} entries (${(stats.storageSize / 1024.0).toFixed(2)} KB)`;
                }

                //{collections.forEach((collection) => {console.log(`  > ${collection.name} | ${db_.collection(collection.name).count()} entries, `);});}
            }
            console.log(output);
            console.log("-------------------------------------");
            return output;
        }
        catch (err) { console.error("[!]Unable to log database structure! \n Error: ", err); err_msg("Database structure log", err, DSCclient); }
    },

    /** Create MongoDB collection if it doesn't already exist
     * @param {String} collectionName Name of the collection to be created (loaded from config.json if not specified)
     * @returns {boolean} True if successful
     */
    async createCollection(collectionName, setIndex = false, index = DB.index) {
        try {
            console.log(`[{}]Attempting to create collection '${collectionName}'...`);

            const collectionNames = await db.listCollections({ name: collectionName }).toArray();
            if (collectionNames.length > 0) {
                console.log(`[i]Collection '${collectionName}' already exists`);
                return;
            }

            await db.createCollection(collectionName);
            if (setIndex) {
                console.log(`[{}]Indexing collection '${collectionName}' with optoins: \n ${JSON.stringify(index)}`);
                await db.collection(collectionName).createIndex(index);
            }

            console.log(`[i]Collection '${collectionName}' created successfully\n`);
            return true;
        }
        catch (err) { console.error(`[!]Unable to create collection! \n Error: `, err); err_msg("Database collection creation", err, DSCclient); return false; }
    },

    /** Insert entry into collection
     * @param {Object} data Data to be inserted into collection
     * @param {Object} options Additional insertion options for MongoDB
     * @param {String} collectionName Name of the collection to insert data into (loaded from config.json if not specified)
     * @returns {boolean} True if successful
     */
    async write(collectionName, data, options) {
        try {
            console.log(`[{}]Attempting to write data to collection: '${collectionName}'...`);
            let result;
            if (typeof data === "object") { result = await db.collection(collectionName).insertOne(data, options); console.log(`[i]Inserted entry to database (ID: ${result.insertedId})`); }
            else if (Array.isArray(data)) { result = await db.collection(collectionName).insertMany(data, options); console.log(`[i]Inserted ${result.insertedCount} entries to database`); }
            else { console.error("[!]Error: Input data must be an object or an array of objects!"); }
            return true;
        }
        catch (err) { console.error('[!]Unable to write to collection! \n Error: ', err); err_msg("Database entry insertion", err, DSCclient); return false; }
    },

    /** Retrieve entry from collection
     * @param {Object} query MongoDB query object
     * @param {Object} options Additional options for MongoDB find operation
     * @param {String} collectionName Name of collection to retrieve data from (loaded from config.json if not specified)
     * @returns {Object} Object received from database
     */
    async get(collectionName, query, options) {
        try {
            console.log(`[{}]Attempting to find entry in collection '${collectionName}'...`);
            let data = await db.collection(collectionName).findOne(query, options);
            return data;
        }
        catch (err) { console.error('[!]Unable to read from collection! \n Error: ', err); err_msg("Database entry retrieval", err, DSCclient); }
    },

    /** Retrieve all matching entries from collection
     * @param {Object} query MongoDB query object
     * @param {Object} options Additional options for MongoDB find operation
     * @param {String} collectionName Name of collection to retrieve data from (loaded from config.json if not specified)
     * @returns {Array} Array of objects received from database
     */
    async getAll(collectionName, query, options) {
        try {
            console.log(`[{}]Attempting to find entry in collection '${collectionName}'...`);
            let data = await db.collection(collectionName).find(query, options).toArray();
            return data;
        }
        catch (err) { console.error('[!]Unable to read from collection! \n Error: ', err); err_msg("Database entry retrieval", err, DSCclient); }
    },

    /** Read all data from collection
     * @param {String} collectionName Name of collection to read data from (loaded from config.json if not specified)
     * @returns {Array} Array of all entrries in collection
     */
    async readAll(collectionName) {
        try {
            console.log(`[{}]Attempting to read data from collection '${collectionName}'...`);
            let content = await db.collection(collectionName).find().toArray();
            return content;
        }
        catch (err) { console.error('[!]Unable to read from collection! \n Error: ', err); err_msg("Full database retrieval", err, DSCclient); }
    },

    /** MongoDB multistep query (AKA aggregation)
     * @param {Array} steps Array of MongoDB aggregation objects
     * @param {String} collectionName Name of collection to read data from (loaded from config.json if not specified)
     * @returns {Array} Array of objects received from database
     */
    async aggregate(collectionName, steps) {
        try {
            console.log(`[{}]Attempting to execute multistep query on collection '${collectionName}'...`);
            console.log(` Steps: ${util.inspect(steps, colors = true)}`);
            let result = await db.collection(collectionName).aggregate(steps).toArray();
            return result;
        }
        catch (err) { console.error('[!]Unable to execute multistep query! \n Error: ', err); err_msg("Database aggregation", err, DSCclient); }
    },

    /** Get number of entries in a collection
     * @param {String} collectionName Name of collection to read data from (loaded from config.json if not specified)
     * @returns {Number} Number of entries found in collection
     * @returns {Number} Number of entries
     */
    async countEntries(collectionName) {
        try {
            console.log(`[{}]Attempting to get number of entries in collection '${collectionName}'...`);
            let count = await db.collection(collectionName).count();
            console.log(`[i]Retrieved ${count} entries from database`);
            return count;
        }
        catch (err) { console.error('[!]Unable to get number of entries! \n Error: ', err); err_msg("Database entry count", err, DSCclient); }
    },

    /** Delete one entry from a collection
     * @param {String} collectionName Name of collection to delete entry from
     * @param {Object} query MongoDB query object to match entry for deletion
     * @returns {boolean} True if successful
    */
    async deleteOne(collectionName, query) {
        try {
            console.log(`[{}]Attempting to delete entry from collection '${collectionName}'...`);
            await db.collection(collectionName).deleteOne(query);
            return true;
        }
        catch (err) { console.error('[!]Unable to delete entry from database! \n Error: ', err); err_msg("Database entry deletion", err, DSCclient); return false; }
    },

    /** Delete more entries from a collection
     * @param {String} collectionName Name of collection to delete entries from
     * @param {Object} query MongoDB query object to match entry for deletion
     * @returns {boolean} True if successful
     */
    async deleteMany(collectionName, query) {
        try {
            console.log(`[{}]Attempting to delete multipe entries from collection '${collectionName}'...`);
            await db.collection(collectionName).deleteMany(query);
            return true;
        }
        catch (err) { console.error('[!]Unable to delete multipe entries from database! \n Error: ', err); err_msg("Database entry deletion", err, DSCclient); return false; }
    },

    /** Search for entries in a collection
     * @param {String} collectionName Name of collection to search for data in
     * @param {Object} query MongoDB object to match entries
     * @param {Object} options MongoDB object to refine query
     * @param {Object} sortOptions MongoDB object to set sorting options
     * @returns {Array} search serults
     */
    async search(collectionName, query, options, sortOptions) {
        try {
            console.log(`[{}]Attempting to search for entris in collection '${collectionName}'...\n query: ${util.inspect(query, colors = true)}\n options: ${util.inspect(options, colors = true)}\n sortOptions: ${util.inspect(sortOptions, colors = true)}`);
            let result = await db.collection(collectionName).find(query, options).sort(sortOptions).toArray();
            //console.log(result);
            console.log(`[i]Found ${result.length} entries`);
            return result;
        }
        catch (err) { console.error('[!]Unable to search the database! \n Error: ', err); err_msg("Database search", err, DSCclient); }
    },

    /** Edit one entry from a collection
     * @param {String} collectionName Name of collection to delete entry from
     * @param {Object} target MongoDB object to match entry for update
     * @param {Object} data MongoDB object to set updated data
     * @returns {Object} edit result
     */
    async edit(collectionName, target, data) {
        try {
            console.log(`[{}]Attempting to edit/update entry in collection '${collectionName}'...`);
            const result = await db.collection(collectionName).updateOne(target, data);
            return result;
        }
        catch (err) { console.error('[!]Unable to edit entry in database! \n Error: ', err); err_msg("Database entry update", err, DSCclient); return { acknowledged: false }; }
    },

    /** Edit one entry from a collection
     * @param {String} collectionName Name of collection to shrink
     * @returns {Object} shrink result
     */
    async shrink(collectionName) {
        try {
            console.log(`[{}]Attempting to shrink collection '${collectionName}'...`);
            const result = await db.command({ compact: collectionName });
            console.log(result);
            return result;
        }
        catch (err) { console.error('[!]Unable to shrink database collection! \n Error: ', err); err_msg("Database collection" + collectionName + "shrink", err, DSCclient); return { ok: 0 }; }
    },

    /** Backs up given collection to a json file
     * @param {String} collectionName Name of collection to be backed up
     * @param {String} filePath Path to folder containing backups
     * @returns {Object} backup result
     */
    async backup(collectionName, filePath) {
        try {
            console.log(`[{}]Attempting to backup collection '${collectionName}'...`);
            fs.mkdirSync(filePath, { recursive: true });
            let filedate = moment().format('YYYY-MM-DD-HH-mm-ss');
            filePath = filePath + "/" + collectionName + "-" + filedate + ".json";

            let data = await db.collection(collectionName).find().toArray();
            fs.writeFileSync(filePath, JSON.stringify(data, "utf-8"));
            let fileSize = fs.statSync(filePath).size;

            let output = {ok: 1, exportedEntries: data.length, fileSize: fileSize.toFixed(2), date: filedate};
            console.log(output);

            console.log(`[{}]Collection backed up to '${filePath}'`);
            return output;
        }
        catch (err) {console.error('[!]Unable to backup collection \n Error: ', err); err_msg("Database collection" + collectionName + "backup", err, DSCclient); return { ok: 0 };}
    },

    /** Restores collection backup from a json file
     * @param {String} collectionName Name of collection to be restored
     * @param {String} filePath Path to json file to restore collectiom from
     * @returns {Object} restore result
     */
    async restore(collectionName, filePath, dump = false) {
        try {
            console.log(`[{}]Attempting to restore collection '${collectionName}' from backup...`);
            let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

            if(dump){
                console.log(`[{}] Dumping collection '${collectionName} data!`);
                let del = await db.collection(collectionName).deleteMany();
            }

            let res = await db.collection(collectionName).insertMany(data);
            if(dump){res.del = del;}

            console.log(res);

            console.log(`[{}]Collection restored from '${filePath}'`);
            return res;
        }
        catch (err) {console.error('[!]Unable to restore collection \n Error: ', err); err_msg("Database collection" + collectionName + "restore", err, DSCclient); return { acknowledged: false };}
    }
}

