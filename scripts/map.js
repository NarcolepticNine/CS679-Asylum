/* Defines an array of strings to use to load game map.
 *
 */

var numFloors = 1;
var Map = new Array(numFloors);
Map[0] = [];

Map[0].push(
"...................fffff\n" +
"..................offfff\n" +
"..................offfff\n" +
"..................offfff\n" +
"............offfffffffff\n" +
".oooooooooooofffffffffff\n" +
"ffffffffffffffffffffffff\n" +
"ffffffffffffffffffffffff\n" +
"ffffffffffffffffffffffff\n" +
"..ffffffff\n" +
"..ffffffff\n" +
"..ffffffff\n" +
"..ffffffff\n" +
"..ffffffff\n" +
"..ffffffff\n" +
"..ffffffff\n" +
"..ffsfffff\n" +
"..ffffffff");

Map[0].push(
"...................wwwww\n" +
"..................4w...w\n" +
"..................4w.W.w\n" +
"..................4w.k.w\n" +
"............4wwwwwww...w\n" +
".333333333333w.w.w.w...w\n" +
"wwwwwwwwwwwww.o.o.owww.w\n" +
"w......................w\n" +
"wwo.......wwwwwwwwwwwwww\n" +
"..wwwwwo.w\n" +
"..w......w\n" +
"..w...w..w\n" +
"..wwwwwo.w\n" +
"..w......w\n" +
"..w...w..w\n" +
"..wwwwwo.w\n" +
"..w......w\n" +
"..wwwwwwww");

Map[0].push(
"...................sssss\n" +
"...................w...e\n" +
"...................w...e\n" +
"...................w...e\n" +
".............nnnnnnw...e\n" +
"............ow.s.s.w...e\n" +
"nnnnnnnnnnnnn.2.2.2nnn.n\n" +
"w......................e\n" +
"ss3.......ssssssssssssss\n" +
"..nnnnn1.e\n" +
"..w......e\n" +
"..w...e..e\n" +
"..nnnnn1.e\n" +
"..w......e\n" +
"..w...e..e\n" +
"..nnnnn1.e\n" +
"..w......e\n" +
"..ssssssss");

Map[0].push(
"...................wooow\n" +
".......................o\n" +
".......................o\n" +
".......................o\n" +
".............wowowo....o\n" +
"............4..w.w.w...w\n" +
"w..................oo..w\n" +
"o......................o\n" +
"wo........ooooooooooooow\n" +
"..wooow..o\n" +
"..o......o\n" +
".........o\n" +
"..wooow..o\n" +
"..o......o\n" +
".........o\n" +
"..wooow..o\n" +
"..o......o\n" +
"..wooow.ow");

Map[0].push(
"...................w333e\n" +
".......................4\n" +
".......................4\n" +
".......................4\n" +
".............w4w4w4....4\n" +
"...............w.w.w...e\n" +
"w..................22..e\n" +
"1......................2\n" +
"w3........3333333333333e\n" +
"..w111e..4\n" +
"..1......4\n" +
".........4\n" +
"..w111e..4\n" +
"..1......4\n" +
".........4\n" +
"..w111e..4\n" +
"..1......4\n" +
"..w333e.3e");

Map[0].push(
".......................o\n" +
"........................\n" +
"........................\n" +
"........................\n" +
".............o.o.o......\n" +
"........................\n" +
"........................\n" +
"o......................o\n" +
".......................o\n" +
"......o...\n" +
"..o.......\n" +
"..........\n" +
"......o...\n" +
"..o.......\n" +
"..........\n" +
"......o...\n" +
"..o.......\n" +
"......o..o");

Map[0].push(
".......................3\n" +
"........................\n" +
"........................\n" +
"........................\n" +
".............2.2.2......\n" +
"........................\n" +
"........................\n" +
"3......................4\n" +
".......................3\n" +
"......1...\n" +
"..3.......\n" +
"..........\n" +
"......1...\n" +
"..3.......\n" +
"..........\n" +
"......1...\n" +
"..3.......\n" +
"......3..3");

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