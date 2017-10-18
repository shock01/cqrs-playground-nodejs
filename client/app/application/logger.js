
let logger = {
    info(msg) {
        console.info('[info]: %s',msg);
    },
    debug(msg) {
        console.log('[debug]: %s',msg);
    },
    warn(msg) {
        console.log('[warn]: %s',msg);
    },
    error(msg) {
        console.log('[error]: %s',msg);
    }

}

module.exports = logger;