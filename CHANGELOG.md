# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://github.com/jackmellis/respite/compare/v3.0.5...v4.0.0) (2021-04-14)


### Features

* **@respite/action:** add key parameter ([90bbc31](https://github.com/jackmellis/respite/commit/90bbc319513b02a4d70df4efb4b65ce7d4bc2651))
* **@respite/core:** replace subscribers with a pub/sub module ([59b3fc6](https://github.com/jackmellis/respite/commit/59b3fc697dd7000c3b304a535434f30a4a4a996d))
* **@respite/exchange:** initial release ([1c38a46](https://github.com/jackmellis/respite/commit/1c38a46e2c95ba4d0f1da4445eb1afe8b6336fd8))


### BREAKING CHANGES

* **@respite/action:** requires the latest version of @respite/core
* **@respite/core:** the query.subscribers property is now a number rather than an array of callbacks
BREKAING CHANGE: useCache no longer returns a getSubscribers method
* **@respite/core:** the Subscriber type is no longer exported





## [3.0.5](https://github.com/jackmellis/respite/compare/v3.0.4...v3.0.5) (2021-04-01)


### Bug Fixes

* **@respite/action:** memoize the action fn ([565ca0c](https://github.com/jackmellis/respite/commit/565ca0cd9bef0ae97bbe6f611dad188324aa09d1))





## [3.0.4](https://github.com/jackmellis/respite/compare/v3.0.3...v3.0.4) (2021-03-19)


### Bug Fixes

* **@respite/query:** handle 0 ttl renders ([6686473](https://github.com/jackmellis/respite/commit/66864738ddd2ee21e4873860e5fb33ad6dc42bdc))





## [3.0.3](https://github.com/jackmellis/respite/compare/v3.0.2...v3.0.3) (2021-03-19)


### Bug Fixes

* **@respite/core:** fix ttl persistence issues ([2702001](https://github.com/jackmellis/respite/commit/27020019df2df108b038d352a14c7cdaaf5693ab))
* **@respite/core:** fix ttl persistence issues ([854105f](https://github.com/jackmellis/respite/commit/854105f1277e75a344f663967c6393768b918479))





## [3.0.2](https://github.com/jackmellis/respite/compare/v3.0.1...v3.0.2) (2021-03-17)


### Bug Fixes

* **@respite/action:** remove onlyWhenMounted guards ([270c6fa](https://github.com/jackmellis/respite/commit/270c6fa3bc8ddb3c3867fd102ea3a1d9a2bf8de6))
* **@respite/core:** remove onlyWhenMounted guards ([dab9374](https://github.com/jackmellis/respite/commit/dab93743d5cb7ccf46a546a00f3835a54eac3c26))





## [3.0.1](https://github.com/jackmellis/respite/compare/v3.0.0...v3.0.1) (2021-03-09)


### Bug Fixes

* **@respite/query:** remove console log ([2af3c8e](https://github.com/jackmellis/respite/commit/2af3c8e023ee116b80570f914d0174b7af03eb6b))





# [3.0.0](https://github.com/jackmellis/respite/compare/v2.8.0...v3.0.0) (2021-03-09)


### Bug Fixes

* **@respite/core:** refactor to avoid race condition errors ([bdf3109](https://github.com/jackmellis/respite/commit/bdf3109c3f9d59ab7275353c05b2c540508f3ea0))
* **@respite/query:** refactor to avoid race condition errors ([1d26047](https://github.com/jackmellis/respite/commit/1d26047e05e8b34a38b5d253dbc0489142190830))
* **@respite/select:** refactor to avoid race condition errors ([9b96d17](https://github.com/jackmellis/respite/commit/9b96d174d00568696ceb9eb6b8fcc9bedc088928))


### BREAKING CHANGES

* **@respite/select:** the core api has changed significantly
* **@respite/query:** the core api has changed significantly
* **@respite/core:** the core api has changed significantly





# [2.8.0](https://github.com/jackmellis/respite/compare/v2.7.1...v2.8.0) (2021-03-09)


### Features

* **@respite/query:** add suspendOnRefetch option ([75905cf](https://github.com/jackmellis/respite/commit/75905cf69017ff57a179a3f3d8fbcf4116ce4ede))
* **@respite/query:** add suspendOnRefetch option to configuration ([659e7cd](https://github.com/jackmellis/respite/commit/659e7cdad20d5720898bf00d7d75366be7edfc59))





## [2.7.1](https://github.com/jackmellis/respite/compare/v2.7.0...v2.7.1) (2021-02-25)


### Bug Fixes

* **@respite/core:** useConfig should not return a partial type ([5561971](https://github.com/jackmellis/respite/commit/5561971d2c0288f1ea03daa3a78adafbe259e310))
* **@respite/query:** useConfig should be a partial type ([52f806b](https://github.com/jackmellis/respite/commit/52f806b82ac62351a9dcbbb254b221ae671279f0))
* **@respite/query:** useQueryCallback should use global defaults ([d91d765](https://github.com/jackmellis/respite/commit/d91d765d12c56f1ff2637ce0b97a7ed3f9488c79))





# [2.7.0](https://github.com/jackmellis/respite/compare/v2.6.0...v2.7.0) (2021-02-25)


### Features

* **@respite/core:** configure default query options ([6fb991d](https://github.com/jackmellis/respite/commit/6fb991d6ddd0a050469097d8f045545e7e2eaa10)), closes [#32](https://github.com/jackmellis/respite/issues/32)
* **@respite/query:** use default query options ([763414d](https://github.com/jackmellis/respite/commit/763414ddb4c637ea43eb023c36e1054e8bf79af4)), closes [#32](https://github.com/jackmellis/respite/issues/32)
* **@respite/select:** useSelectValue method ([bb5b601](https://github.com/jackmellis/respite/commit/bb5b6017e8bcc9185044c31701973fa2dd6fc2c5)), closes [#18](https://github.com/jackmellis/respite/issues/18)





# [2.6.0](https://github.com/jackmellis/respite/compare/v2.5.1...v2.6.0) (2021-02-25)


### Features

* **@respite/action:** export ActionQuery type ([fd9657d](https://github.com/jackmellis/respite/commit/fd9657d1a6aea29331eee1050ba12d010d9dfed4))





## [2.5.1](https://github.com/jackmellis/respite/compare/v2.5.0...v2.5.1) (2021-02-03)


### Bug Fixes

* **@respite/core:** ttl should be considered when fetching a query ([a19dea0](https://github.com/jackmellis/respite/commit/a19dea00ef0c216a1918b8c786121d242a95eb2a))





# [2.5.0](https://github.com/jackmellis/respite/compare/v2.4.0...v2.5.0) (2021-02-03)


### Bug Fixes

* **@respite/core:** memoize the cache object ([3cc20bf](https://github.com/jackmellis/respite/commit/3cc20bf3d7078e2ba09464b0dba64997d389a291))


### Features

* **@respite/core:** add getSubscriber method to cache ([8ac79ab](https://github.com/jackmellis/respite/commit/8ac79ab73ece03bc87b3b3fb5ef88e8e993a98f7))
* **@respite/query:** useQueryCallback method ([d3f5367](https://github.com/jackmellis/respite/commit/d3f53677b6eaaa9e415a7001afd0377a5079ad2a)), closes [#30](https://github.com/jackmellis/respite/issues/30)





# [2.4.0](https://github.com/jackmellis/respite/compare/v2.2.0...v2.4.0) (2021-01-29)


### Features

* **@respite/core:** add resolve method to Query type ([4c44c2e](https://github.com/jackmellis/respite/commit/4c44c2e6341414afacd1c7e79e51f6e0eb1e3897))
* **@respite/query:** query.resolve method added ([e20fa83](https://github.com/jackmellis/respite/commit/e20fa83e6d6c3d6647d54c186f014dacdfda4ec9))





# [2.2.0](https://github.com/jackmellis/respite/compare/v2.1.0...v2.2.0) (2021-01-29)


### Features

* **@respite/query:** export QueryOptions type ([dd4b59f](https://github.com/jackmellis/respite/commit/dd4b59f51a6b361f6d3048b4c54bef0864dc3803))





# [2.1.0](https://github.com/jackmellis/respite/compare/v2.0.2...v2.1.0) (2021-01-28)


### Bug Fixes

* mark all packages as side effect free ([f9d643d](https://github.com/jackmellis/respite/commit/f9d643d72691e178d8ae53ec2157ad9e47fbc6d2)), closes [#22](https://github.com/jackmellis/respite/issues/22)
* update peer dependency ranges ([2c6f485](https://github.com/jackmellis/respite/commit/2c6f485054ac2d37a343f3312646511a01c099e5)), closes [#26](https://github.com/jackmellis/respite/issues/26)
* **@respite/atom:** memoize atom setState method ([e2fc6e6](https://github.com/jackmellis/respite/commit/e2fc6e601b19b681061d468c7e3f1530d534d066)), closes [#27](https://github.com/jackmellis/respite/issues/27)


### Features

* **@respite/atom:** useInitialize hook ([96b209e](https://github.com/jackmellis/respite/commit/96b209eb911b3348c722c054287a9894f071babc)), closes [#28](https://github.com/jackmellis/respite/issues/28)





## [2.0.2](https://github.com/jackmellis/respite/compare/v2.0.1...v2.0.2) (2021-01-27)


### Bug Fixes

* **@respite/action:** useAction was not correctly inferring the type of data ([1266af4](https://github.com/jackmellis/respite/commit/1266af4e1671685bc4af1fb24c92b0f664b0a55a))





## [2.0.1](https://github.com/jackmellis/respite/compare/v2.0.0...v2.0.1) (2021-01-24)


### Bug Fixes

* **atom:** memoize atom setter ([3cdf404](https://github.com/jackmellis/respite/commit/3cdf4040809bd169acce04b99d8aeb3b43836800))





# 2.0.0 (2021-01-14)


### Features

* **action:** initial development ([afaa05c](https://github.com/jackmellis/respite/commit/afaa05c8bfb4999c7166a449eb42628569555ef1))
* **atom:** initial development ([fe068c4](https://github.com/jackmellis/respite/commit/fe068c49c8e945fa01e442c40874d551808ce00e))
* **core:** initial development ([314b14a](https://github.com/jackmellis/respite/commit/314b14af54e907132fa2c6f689cdc75645d3c704))
* **demos:** add todo list demo ([f43c7fd](https://github.com/jackmellis/respite/commit/f43c7fd10082763c00a3e29ba72db06724932277))
* **query:** initial development ([77a3350](https://github.com/jackmellis/respite/commit/77a3350bb93cf0449e6f7bf1694acb5aa9d0d09c))
* **query:** retry can return a delayed promise ([e0a75ca](https://github.com/jackmellis/respite/commit/e0a75ca219ee73eae47632a63bcd877a4a477c06))
* **select:** initial development ([bbc5832](https://github.com/jackmellis/respite/commit/bbc5832038d93e9eb73e5d3f89c54f95c7612b35))





# 1.0.0 (2021-01-14)


### Features

* **action:** initial development ([afaa05c](https://github.com/jackmellis/respite/commit/afaa05c8bfb4999c7166a449eb42628569555ef1))
* **atom:** initial development ([fe068c4](https://github.com/jackmellis/respite/commit/fe068c49c8e945fa01e442c40874d551808ce00e))
* **core:** initial development ([314b14a](https://github.com/jackmellis/respite/commit/314b14af54e907132fa2c6f689cdc75645d3c704))
* **demos:** add todo list demo ([f43c7fd](https://github.com/jackmellis/respite/commit/f43c7fd10082763c00a3e29ba72db06724932277))
* **query:** initial development ([77a3350](https://github.com/jackmellis/respite/commit/77a3350bb93cf0449e6f7bf1694acb5aa9d0d09c))
* **query:** retry can return a delayed promise ([e0a75ca](https://github.com/jackmellis/respite/commit/e0a75ca219ee73eae47632a63bcd877a4a477c06))
* **select:** initial development ([bbc5832](https://github.com/jackmellis/respite/commit/bbc5832038d93e9eb73e5d3f89c54f95c7612b35))
