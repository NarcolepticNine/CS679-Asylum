/* Defines an array of strings to use to load game map.
 *
 */

var numFloors = 1;
var Map = new Array(numFloors);
Map[0] = [];

Map[0].push(
"...............wwwww\n" +
"..............offfff\n" +
"..............offfff\n" +
".........o.o.oofffff\n" +
"........offfffffffff\n" +
".oooooooofffffffffff\n" +
"fffffffffffffffpffff\n" +
"ffffffffffpfffffffff\n" +
"ffffffffffffffffffff\n" +
".fffpf\n" +
".fffff\n" +
".fffff\n" +
".ffpff\n" +
".fffff\n" +
".ffpff\n" +
".fffff\n" +
".fsfff\n" +
".fffff");

Map[0].push(
"...............sssss\n" +
"..............4i...i\n" +
"..............4w.W.w\n" +
".........4.4.44w.k.w\n" +
"........4wwwwwww...w\n" +
".33333333w.w.w.w...w\n" +
"wiwwiwwww.o.o.owww.w\n" +
"o..................w\n" +
"wo...owwwiwwwwwwiwww\n" +
".wwwww\n" +
".w..wi\n" +
".i..ow\n" +
".wwwww\n" +
".i..wi\n" +
".w...w\n" +
".wwwww\n" +
".w..ww\n" +
".wwwww");

Map[0].push(
"...............wooow\n" +
"...............w...e\n" +
"...............w...e\n" +
"...............w...e\n" +
".........nnnnnnw...e\n" +
"........ow.s.s.w...e\n" +
"nnnnnnnnn.2.2.2nnn.n\n" +
"3..................e\n" +
"s3...3ssssssssssssss\n" +
".nnnne\n" +
".w..ee\n" +
".w..3e\n" +
".nnnne\n" +
".w..ee\n" +
".w...e\n" +
".nnnne\n" +
".w..ee\n" +
".sssss");

Map[0].push(
"...............w333e\n" +
"...................o\n" +
"...................o\n" +
"...................o\n" +
".........wowowo....o\n" +
"........4..w.w.w...w\n" +
"w..............oo..w\n" +
"o..................o\n" +
"w.....ooooooooooooow\n" +
".woowo\n" +
".o..lo\n" +
".....o\n" +
".ioowo\n" +
".o..lo\n" +
".b...o\n" +
".ioowo\n" +
".o..lo\n" +
".wooow");

Map[0].push(
"...................o\n" +
"...................4\n" +
"...................4\n" +
"...................4\n" +
".........w4w4w4....4\n" +
"...........w.w.w...e\n" +
"w..............22..e\n" +
"1..................2\n" +
"w.....3333333333333e\n" +
".w11e4\n" +
".1..e4\n" +
".....4\n" +
".w11e4\n" +
".1..e4\n" +
".e...4\n" +
".w11e4\n" +
".1..e4\n" +
".w333e");

Map[0].push(
"...................3\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"...........aaaa.....\n" +
"...............a....\n" +
"....................\n" +
"...................o\n" +
"...................o\n" +
".b.oao\n" +
".o....\n" +
".....o\n" +
"...aao\n" +
".o....\n" +
".....o\n" +
"...oao\n" +
".o....\n" +
".b...o");

Map[0].push(
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"...........nnnn.....\n" +
"...............w....\n" +
"....................\n" +
"...................4\n" +
"...................3\n" +
".e.2e3\n" +
".3....\n" +
".....3\n" +
"...nn3\n" +
".3....\n" +
".....3\n" +
"...2e3\n" +
".3....\n" +
".n...3");

//Map[1] = [];
//Map[1].push(
//"wwwwwwwwwwwwww\n" +
//"w            w\n" +
//"w            w\n" +
//"w       ww  ww\n" +
//"w       w    wwwwwwwwwwwwwwwwww\n" +
//"w            w   w   w        w\n" +
//"w            w   w   w        w\n" +
//"w       w    w   w   w        w\n" +
//"wwwwwwwww    ww www wwwww  wwww\n" +
//"w                             w\n" +
//"w                             w\n" +
//"w                             w\n" +
//"wwww wwww    wwwwwwwwwwwwwwwwww\n" +
//"w       w    w\n" +
//"w       w    w\n" +
//"w            w\n" +
//"w       w    w\n" +
//"w       w    w\n" +
//"wwwwwwwww    w\n" +
//"w       w    w\n" +
//"w            w\n" +
//"w       w    w\n" +
//"wwwwwwwww    w\n" +
//"wf      w    w\n" +
//"w            w\n" +
//"w       w    w\n" +
//"wwwwwwwwwwwwww");

//Map[2] = [];
//Map[2].push(
//"wwwwwwwwwwwwww\n" +
//"wccccccccccccw\n" +
//"wccccccccccccw\n" +
//"wcccccccwwccww\n" +
//"wcccccccwccccwwwwwwwwwwwwwwwwww\n" +
//"wccccccccccccwcccwcccwccccccccw\n" +
//"wccccccccccccwcccwcccwccccccccw\n" +
//"wcccccccwccccwcccwcccwccccccccw\n" +
//"wwwwwwwwwccccwwcwwwcwwwwwccwwww\n" +
//"wcccccccccccccccccccccccccccccw\n" +
//"wcccccccccccccccccccccccccccccw\n" +
//"wcccccccccccccccccccccccccccccw\n" +
//"wwwwcwwwwccccwwwwwwwwwwwwwwwwww\n" +
//"wcccccccwccccw\n" +
//"wcccccccwccccw\n" +
//"wccccccccccccw\n" +
//"wcccccccwccccw\n" +
//"wcccccccwccccw\n" +
//"wwwwwwwwwccccw\n" +
//"wcccccccwccccw\n" +
//"wccccccccccccw\n" +
//"wcccccccwccccw\n" +
//"wwwwwwwwwccccw\n" +
//"wcccccccwccccw\n" +
//"wccccccccccccw\n" +
//"wcccccccwccccw\n" +
//"wwwwwwwwwwwwww");