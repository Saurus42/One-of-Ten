import router = require( './router' );
import Points = require( '../controller/Points' );
const controller = new Points();

router.send( 'points', 'get', 'api', controller.get );
router.send( 'points', 'post', 'api', controller.post );
router.send( 'points', 'put', 'api', controller.put );
router.send( 'points', 'delete', 'api', controller.delete );