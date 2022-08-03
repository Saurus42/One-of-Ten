import router = require( './router' );
import Messages = require( '../controller/Messages' );
const controller = new Messages();

router.send( 'messages', 'get', 'api', controller.get );
router.send( 'messages', 'post', 'api', controller.post );
router.send( 'messages', 'put', 'api', controller.put );
router.send( 'messages', 'delete', 'api', controller.delete );