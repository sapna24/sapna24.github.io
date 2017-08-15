var todoDB = (function() {
  var tDB = {};
  var db, todo, datastore;
  var datastore = null;   //Store a reference to the database

  tDB.open = function(callback) {
    var request = indexedDB.open('todos', 1);

    request.onupgradeneeded = function(e) {
      var db = e.target.result;
      e.target.transaction.onerror = tDB.onerror;

      if (db.objectStoreNames.contains('todo')) {
        db.deleteObjectStore('todo');
      }

      var store = db.createObjectStore('todo', {
        keyPath: 'timestamp'
      });
    };

    request.onsuccess = function(e) {
      datastore = e.target.result;
      callback();
    };

    request.onerror = tDB.onerror;
  };

  tDB.fetchTodos = function(callback) {
    initialize();

    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = objStore.openCursor(keyRange);
    var todos = [];

    transaction.oncomplete = function(e) {
      callback(todos);
    };

    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;
      if (!!result == false) {
        return;
      }

      todos.push(result.value);
      result.continue();
    };

    cursorRequest.onerror = tDB.onerror;
  };

  /**
 * Create a new todo item.
 */
  tDB.createTodo = function(text, callback) {
    initialize();
    var timestamp = new Date().getTime();

    var todo = {
      'text': text,
      'timestamp': timestamp
    };

    var request = objStore.put(todo);

    request.onsuccess = function(e) {
      callback(todo);
    };

    request.onerror = tDB.onerror;
  };

  /**
 * Delete a todo item.
 */
  tDB.deleteTodo = function(id, callback) {
    initialize();
    var request = objStore.delete(id);

    request.onsuccess = function(e) {
      callback();
    }
  };

  function initialize() {
    db = datastore;
    transaction = db.transaction(['todo'], 'readwrite');
    objStore = transaction.objectStore('todo');
  }

  // Export the tDB object.
  return tDB;
}());
