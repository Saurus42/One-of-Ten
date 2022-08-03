import History = require( 'history' );

export = typeof window === 'undefined' ? History.createMemoryHistory() : History.createBrowserHistory();