/*
* Check async function with timeout
* Eg:
* setTimout(() => {
*   check(done, () => {
*     Promise.then().catch();
* }, 100)
*/
export function check ( done, f ) {
  try {
    f();
    done();
  } catch( e ) {
    done( e )
  }
};

/*
* Check async with async function
* Eg:
* checkAsync(async (done) => {
*   try{
*     expect...
*   } catch(err) {
*     expect...
*   }
*})
*/
export function checkAsync (fn) {
  return async (done) => {
    try {
      await fn();
      done();
    } catch (err) {
      done(err);
    }
  };
};

