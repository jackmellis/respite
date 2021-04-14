# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://github.com/jackmellis/respite/compare/v3.0.5...v4.0.0) (2021-04-14)


### Features

* **@respite/core:** replace subscribers with a pub/sub module ([59b3fc6](https://github.com/jackmellis/respite/commit/59b3fc697dd7000c3b304a535434f30a4a4a996d))


### BREAKING CHANGES

* **@respite/core:** the query.subscribers property is now a number rather than an array of callbacks
BREKAING CHANGE: useCache no longer returns a getSubscribers method
* **@respite/core:** the Subscriber type is no longer exported





## [3.0.3](https://github.com/jackmellis/respite/compare/v3.0.2...v3.0.3) (2021-03-19)


### Bug Fixes

* **@respite/core:** fix ttl persistence issues ([854105f](https://github.com/jackmellis/respite/commit/854105f1277e75a344f663967c6393768b918479))





## [3.0.2](https://github.com/jackmellis/respite/compare/v3.0.1...v3.0.2) (2021-03-17)


### Bug Fixes

* **@respite/core:** remove onlyWhenMounted guards ([dab9374](https://github.com/jackmellis/respite/commit/dab93743d5cb7ccf46a546a00f3835a54eac3c26))





# [3.0.0](https://github.com/jackmellis/respite/compare/v2.8.0...v3.0.0) (2021-03-09)


### Bug Fixes

* **@respite/core:** refactor to avoid race condition errors ([bdf3109](https://github.com/jackmellis/respite/commit/bdf3109c3f9d59ab7275353c05b2c540508f3ea0))


### BREAKING CHANGES

* **@respite/core:** the core api has changed significantly





# [2.8.0](https://github.com/jackmellis/respite/compare/v2.7.1...v2.8.0) (2021-03-09)


### Features

* **@respite/query:** add suspendOnRefetch option to configuration ([659e7cd](https://github.com/jackmellis/respite/commit/659e7cdad20d5720898bf00d7d75366be7edfc59))





## [2.7.1](https://github.com/jackmellis/respite/compare/v2.7.0...v2.7.1) (2021-02-25)


### Bug Fixes

* **@respite/core:** useConfig should not return a partial type ([5561971](https://github.com/jackmellis/respite/commit/5561971d2c0288f1ea03daa3a78adafbe259e310))





# [2.7.0](https://github.com/jackmellis/respite/compare/v2.6.0...v2.7.0) (2021-02-25)


### Features

* **@respite/core:** configure default query options ([6fb991d](https://github.com/jackmellis/respite/commit/6fb991d6ddd0a050469097d8f045545e7e2eaa10)), closes [#32](https://github.com/jackmellis/respite/issues/32)





## [2.5.1](https://github.com/jackmellis/respite/compare/v2.5.0...v2.5.1) (2021-02-03)


### Bug Fixes

* **@respite/core:** ttl should be considered when fetching a query ([a19dea0](https://github.com/jackmellis/respite/commit/a19dea00ef0c216a1918b8c786121d242a95eb2a))





# [2.5.0](https://github.com/jackmellis/respite/compare/v2.4.0...v2.5.0) (2021-02-03)


### Bug Fixes

* **@respite/core:** memoize the cache object ([3cc20bf](https://github.com/jackmellis/respite/commit/3cc20bf3d7078e2ba09464b0dba64997d389a291))


### Features

* **@respite/core:** add getSubscriber method to cache ([8ac79ab](https://github.com/jackmellis/respite/commit/8ac79ab73ece03bc87b3b3fb5ef88e8e993a98f7))





# [2.4.0](https://github.com/jackmellis/respite/compare/v2.2.0...v2.4.0) (2021-01-29)


### Features

* **@respite/core:** add resolve method to Query type ([4c44c2e](https://github.com/jackmellis/respite/commit/4c44c2e6341414afacd1c7e79e51f6e0eb1e3897))





# [2.1.0](https://github.com/jackmellis/respite/compare/v2.0.2...v2.1.0) (2021-01-28)


### Bug Fixes

* mark all packages as side effect free ([f9d643d](https://github.com/jackmellis/respite/commit/f9d643d72691e178d8ae53ec2157ad9e47fbc6d2)), closes [#22](https://github.com/jackmellis/respite/issues/22)





# 2.0.0 (2021-01-14)


### Features

* **core:** initial development ([314b14a](https://github.com/jackmellis/respite/commit/314b14af54e907132fa2c6f689cdc75645d3c704))





# 1.0.0 (2021-01-14)


### Features

* **core:** initial development ([314b14a](https://github.com/jackmellis/respite/commit/314b14af54e907132fa2c6f689cdc75645d3c704))
