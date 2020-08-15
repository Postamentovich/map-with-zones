import { pause } from "../utils/api-helpers";

export class UserApi {
    async sendInfoAboutIncludedZones(info) {
        await pause();
        console.log(info);
    }
}
