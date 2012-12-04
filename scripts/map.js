/* Defines an array of strings to use to load game map.
 *
 */

var numFloors = 1;
var Map = new Array(numFloors);
Map[0] = [];

Map[0].push(
"...............wwiww\n" +
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
"..............4ia.ai\n" +
"..............4w.W.w\n" +
".........4.4.44w.k.w\n" +
"........4wwwwwww...w\n" +
".33333333w.wdwdw..dw\n" +
"wiwwiwwww.o.o.owwwow\n" +
"D..................w\n" +
"wo...owwwiwiwiwiiwww\n" +
".wwdwi\n" +
".w..wi\n" +
".i.odw\n" +
".wwwww\n" +
".i..wi\n" +
".w..di\n" +
".wwwww\n" +
".w..ww\n" +
".wwwww");

Map[0].push(
"................oooo\n" +
"...............wn.ne\n" +
"...............w...e\n" +
"...............w...e\n" +
".........nnnnnnw...e\n" +
"........ow.s2s2w..2e\n" +
"nnnnnnnnn.2.2.2nnn2n\n" +
"w..................e\n" +
"s3...3ssssssssssssss\n" +
".nn4ne\n" +
".w..ee\n" +
".w.4ee\n" +
".nnnne\n" +
".w..ee\n" +
".w..ee\n" +
".nnnne\n" +
".w..ee\n" +
".sssss");

Map[0].push(
"................3333\n" +
"...................o\n" +
"...............u...o\n" +
"...............u...o\n" +
".........wowowo....o\n" +
"........4..w.w.w...w\n" +
"w.uu...........oo..w\n" +
"...................o\n" +
"w.....ooooooooooooow\n" +
".woowo\n" +
".o..lo\n" +
".....o\n" +
".ioowo\n" +
".o..lo\n" +
".b...o\n" +
".ioowo\n" +
".o..lo\n" +
".woodw");

Map[0].push(
"....................\n" +
"...................4\n" +
"...............w...4\n" +
"...............w...4\n" +
".........w4w4w4....4\n" +
"...........w.w.w...e\n" +
"w.nn...........22..e\n" +
"...................2\n" +
"w.....3333333333333e\n" +
".w11e4\n" +
".1..e4\n" +
".....4\n" +
".w11e4\n" +
".1..e4\n" +
".e...4\n" +
".w11e4\n" +
".1..e4\n" +
".w33ee");

Map[0].push(
"....................\n" +
"....................\n" +
"...................u\n" +
"...................u\n" +
"...........aaaa.....\n" +
"...............a....\n" +
"....................\n" +
"...................o\n" +
"........u.u.u.u..uuo\n" +
".b..ao\n" +
".o....\n" +
".....o\n" +
"...aao\n" +
".o....\n" +
".....o\n" +
"..eoao\n" +
".o....\n" +
".b..oo");

Map[0].push(
"....................\n" +
"....................\n" +
"...................e\n" +
"...................e\n" +
"...........nnnn.....\n" +
"...............w....\n" +
"....................\n" +
"...................4\n" +
"........s.s.s.s..ss3\n" +
".e..e3\n" +
".3....\n" +
".....3\n" +
"...nn3\n" +
".3....\n" +
".....3\n" +
"...2e3\n" +
".3....\n" +
".n..33");

Map[0].push(
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"......\n" +
"......\n" +
".....u\n" +
".....u\n" +
"......\n" +
"......\n" +
"......\n" +
"......\n" +
".....n");

Map[0].push(
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"....................\n" +
"......\n" +
"......\n" +
".....e\n" +
".....e\n" +
"......\n" +
"......\n" +
"......\n" +
"......\n" +
".....e");




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