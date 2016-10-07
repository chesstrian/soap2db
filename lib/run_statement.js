var sql = require('mssql');

/**
 * Method to INSERT or UPDATE rows in a table
 * @param transaction
 * @param statement SQL Statement to run
 * @return result Boolean value, return false if any error.
 */
module.exports = function (transaction, statement) {
  transaction.begin(function (err) {
    if (err) {
      return false;
    }

    var request = new sql.Request(transaction);
    request.query(statement)
      .then(function (recordSet) {
        transaction
          .commit()
          .then(function (recordSet) {
            return true;
          })
          .catch(function (err) {
            return false;
          });
      })
      .catch(function (err) {
        return false;
      });
  });
};
