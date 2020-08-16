import { delay } from "../utils/api-helpers";

export class UserApi {
    async sendInfoAboutIncludedZones(info) {
        await delay();
        console.log(info);
    }
}
