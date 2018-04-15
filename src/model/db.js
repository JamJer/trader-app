/**
 * Provide local storage for current user
 * - record user info (product key)
 * - user's trading policies
 * - user's trading information
 * 
 * using sqlite3 -> less dependencies
 * (need to remind window's user)
 */

class db {
    init(){
        var sqlite3 = require("sqlite3").verbose();
        // need to specify from repository root
        var db = new sqlite3.Database('./src/db/storage.db');
        var check;
        db.serialize(function() {
            // create table
            db.run("CREATE TABLE if not exists user_info (info TEXT)");
            /*var stmt = db.prepare("INSERT INTO user_info VALUES (?)");
            for (var i = 0; i < 10; i++) {
                stmt.run("Ipsum " + i);
            }
            stmt.finalize();

            db.each("SELECT rowid AS id, info FROM user_info", function(err, row) {
                console.log(row.id + ": " + row.info);
            });*/
        });

        db.close();
    }
}

module.exports = {
    db: new db()
}