import Mock from 'mockjs';

const Patches = [];

for (let i = 0; i < 66; i++) {
    Patches.push(Mock.mock({
        id: Mock.Random.guid(),
        patch_name: Mock.Random.cname(),
        patch_type: Mock.Random.guid(),
        patch_version: Mock.Random.d8()
    }))
}

export {Patches};
