var log4js = require('log4js')
	, syslog = require('node-syslog');


var levels = {}
levels[log4js.levels.ALL] = syslog.LOG_DEBUG;
levels[log4js.levels.TRACE] = syslog.LOG_DEBUG;
levels[log4js.levels.DEBUG] = syslog.LOG_DEBUG;
levels[log4js.levels.INFO] = syslog.LOG_INFO;
levels[log4js.levels.WARN] = syslog.LOG_WARNING;
levels[log4js.levels.ERROR] = syslog.LOG_ERR;
levels[log4js.levels.FATAL] = syslog.LOG_CRIT;

function getOptions(flags) {
	var opts = 0;
	if(Array.isArray(flags)) {
		for(var i = 0, len = flags.length; i < len; i++) {
			opts = opts | flags[i];
		}
	}
	return opts;
}

function getSyslogLevel(level) {
	return level && levels[level] ? levels[level] : null;
}

function open(config) {
	config = config || {}

	var name = (config.ident || config.name || 'node-syslog') + ''
		, optsVal = config.flags ? getOptions(config.flags) : (syslog.LOG_PID | syslog.LOG_CONS | syslog.LOG_ODELAY)
		, facility = config.facility || syslog.LOG_USER;

	// no need to check if it's already open, the lib does that
	syslog.init(name, optsVal, facility);
}

function syslogAppender (config) {
	open(config);
  return function(loggingEvent) {
		var level = getSyslogLevel(loggingEvent.level)
			, data = loggingEvent.data
			, layout

	  if(level) {
	  	layout = config && config.layout ? config.layout : layouts.basicLayout; 
			data = layout(loggingEvent);

		  syslog.log(level, data);
		}
  };
}

// This is a binding so no context needed for close function
process.on('exit', syslog.close);

exports.name = "syslog";
exports.appender = syslogAppender;
exports.configure = open;
exports.open = open;
exports.close = syslog.close;
