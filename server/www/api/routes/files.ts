import router = require( './router' );
import Files = require( '../controller/Files' );
const controller = new Files();

router.send( 'images', 'get', 'image', controller.image );
router.send( 'key', 'get', 'api', controller.key );