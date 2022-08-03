import router = require( './router' );
import Addresses = require( '../controller/Addresses' );
const controller = new Addresses();

router.send( 'addresses', 'get', 'api', controller.get );
router.send( 'addresses', 'post', 'api', controller.post );
router.send( 'addresses', 'put', 'api', controller.put );
router.send( 'addresses', 'delete', 'api', controller.delete );