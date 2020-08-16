/** This is dummy function to simulate a delay in response from api  */
export async function delay() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 100);
    });
}
