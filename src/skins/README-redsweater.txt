Basically I want to tweak lightgray a bit but don't seem to be able to impose my tweaks reliably dynamically at runtime. So I maintain a separate theme for redsweater that is based on lightgray, and currently built manually from a full copy of lightgray, then applying the patches in redsweater-light-gray-skin-patches at the root of the repository.

For each patch in redsweater-lightgray-skin-patches, e.g. 

patch -p1 < redsweater.savedDiff

