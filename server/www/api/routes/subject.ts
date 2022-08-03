import router = require( './router' );
import Subjects = require( '../controller/Subjects' );
const controller = new Subjects();

router.send( 'subject', 'get', 'api', controller.get );
router.send( 'subject', 'post', 'api', controller.post );
router.send( 'subject', 'put', 'api', controller.put );
router.send( 'subject', 'delete', 'api', controller.delete );