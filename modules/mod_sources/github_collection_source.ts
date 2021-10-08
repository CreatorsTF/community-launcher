import GithubSource from "./github_source";

export default class GithubCollectionSource extends GithubSource {

    async GetFileURL(collection_version: number): Promise<string | string[]> {
        const githubData = await this._GetGithubData();
        const releaseAssets = githubData[0].assets;
        if (releaseAssets != null && releaseAssets != []) {
            return this.GetFileURLs(githubData, this.data[collection_version].asset_index);
        }
        else {
            throw new Error("This Github repository has no releases avaliable.");
        }
    }
}
