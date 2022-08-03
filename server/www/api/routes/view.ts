import router = require( './router' );
import View = require( '../controller/View' );
const controller = new View();

router.send( '', 'get', 'image', controller.index );
router.send( ':page1', 'get', 'image', controller.index );
router.send( 'font/:font1/:font2', 'get', 'image', controller.file );
router.send( 'js/:script', 'get', 'image', controller.file );
router.send( 'js/:jose/:script', 'get', 'image', controller.file );
router.send( 'js/:jose/:jwe/:script', 'get', 'image', controller.file );
router.send( 'js/:jose/:jwe/:compact/:script', 'get', 'image', controller.file );
router.send( 'style/:style', 'get', 'image', controller.file );
router.send( 'images/:image', 'get', 'image', controller.file );
router.send( 'favicon.ico', 'get', 'image', controller.file );
router.send( ':page1/:page2', 'get', 'image', controller.index );
router.send( ':page1/:page2/:page3', 'get', 'image', controller.index );