import router = require( './router' );
import Address = require( '../controller/Address' );
const controller = new Address();

router.send( 'address', 'get', 'api', controller.get );
router.send( 'address', 'post', 'api', controller.post );
router.send( 'address', 'put', 'api', controller.put );
router.send( 'address', 'delete', 'api', controller.delete );