var log4js = require('log4js')
	, lsyslog = require('log4js-syslog')
	, syslog = require('node-syslog')

log4js.addAppender(lsyslog.appender(), 'syslog');

var logger = log4js.getLogger('syslog')
	, msg = 'TEST: log4js-syslog - '
	, times = 5;

function test() {
	if(times-- > 0) {
		logger.info(msg + 'INFO');
		logger.debug(msg + 'DEBUG');
		logger.error(msg + 'ERROR');
		setTimeout(test, 1000);
	}
}

test();