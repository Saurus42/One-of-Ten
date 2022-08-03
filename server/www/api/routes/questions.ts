import router = require( './router' );
import Questions = require( '../controller/Questions' );
const controller = new Questions();

router.send( 'questions', 'get', 'api', controller.get );
router.send( 'questions', 'post', 'api', controller.post );
router.send( 'questions', 'put', 'api', controller.put );
router.send( 'questions', 'delete', 'api', controller.delete );