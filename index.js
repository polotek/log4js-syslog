var log4js = require('log4js')
	, layouts = log4js.layouts
	, syslog = require('node-syslog');


var levels = {}
levels[log4js.levels.DEBUG] = syslog.LOG_DEBUG;
levels[log4js.levels.INFO] = syslog.LOG_INFO;
levels[log4js.levels.WARN] = syslog.LOG_WARNING;
levels[log4js.levels.ERROR] = syslog.LOG_ERROR;
levels[log4js.levels.FATAL] = syslog.LOG_CRIT;
levels[log4js.levels.TRACE] = syslog.LOG_NOTICE;

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
	return level && levels[level] ? levels[level] : syslog.LOG_INFO;
}

function open(config) {
	config = config || {}

	var name = (config.ident || config.name || 'node-syslog') + ''
		, optsVal = config.flags ? getOptions(config.flags) : (syslog.LOG_PID | syslog.LOG_CONS | syslog.LOG_ODELAY)
		, facility = config.facility || syslog.LOG_USER;

	// no need to check if it's already open, the lib does that
	syslog.init(name, optsVal, facility);
}

function log(loggingEvent) {
	var level = getSyslogLevel(loggingEvent.level);
	//console.log('syslogging', arguments)
	console._preLog4js_error(loggingEvent);
  syslog.log(level, loggingEvent.data);
}

function syslogAppender (layout) {
    layout = layout || layouts.colouredLayout;
    return function(loggingEvent) {
	    log(layout(loggingEvent));
    };
}

function configure(config) {
    var layout;
    if (config.layout) {
			layout = layouts.layout(config.layout.type, config.layout);
    }
    open(config);
    return syslogAppender(layout);
}

process.on('exit', syslog.close);

open();
exports.name = "syslog";
exports.appender = syslogAppender;
exports.configure = configure;
