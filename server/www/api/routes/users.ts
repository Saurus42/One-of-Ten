import router = require( './router' );
import Users = require( '../controller/Users' );
const controller = new Users();

router.send( 'login', 'post', 'api', controller.login );
router.send( 'users', 'get', 'api', controller.get );
router.send( 'users', 'post', 'api', controller.post );
router.send( 'users', 'put', 'api', controller.put );
router.send( 'users', 'delete', 'api', controller.delete );