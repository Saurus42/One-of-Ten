import router = require( './router' );
import Classes = require( '../controller/Classes' );
const controller = new Classes();

router.send( 'classes', 'get', 'api', controller.get );
router.send( 'classes', 'post', 'api', controller.post );
router.send( 'classes', 'put', 'api', controller.put );
router.send( 'classes', 'delete', 'api', controller.delete );