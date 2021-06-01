<template>
  <div style="height: 100%; overflow: auto;">
    <div style="text-align: left; font-size: 14px; margin-left: 20px">
      <p>
        <span style="line-height:1.5;font-size:15px;">pytest语法说明</span>
      </p>
      <br />
      <br />
      <h3>
        <span style="background-color:#FFE500;">环境变量</span>
      </h3>
      <br />
      <p>
        key-value字符串，通过env_vars.name引用。比如域名：
        <br />
        变量名domain，变量值https://qa.com
      </p>
      <br />
      <h3>
        <span style="background-color:#FFE500;">fixtures</span>
      </h3>
      <br />
      <p>
        依赖注入函数，封装API等，供测试用例调用。比如登录接口：
        <br />
      </p>
      <pre v-highlightA><code >from tep.client import request
from tep.fixture import *


def _jwt_headers(token):
    return {"Content-Type": "application/json", "authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def login(env_vars):
    # Code your login
    logger.info("Administrator login")
    response = request(
        "post",
        url=env_vars.domain + "/api/users/login",
        headers={"Content-Type": "application/json"},
        json={
            "username": "dongfanger",
            "password": "123",
        }
    )
    assert response.status_code &#60; 400
    response_token = jmespath.search("token", response.json())
    super_admin_id = jmespath.search("user.id", response.json())

    class Clazz:
        token = response_token
        jwt_headers = _jwt_headers(response_token)
        admin_id = super_admin_id

    return Clazz
      </code></pre>
      <br />
      其中url是个fixture，返回环境变量env_vars.domain+入参api_path拼接后的完整url。
      <br />
      <br />
      <h3>
        <span style="background-color:#FFE500;">用例示例</span>
      </h3>
      <br />
      <p>
        <b>单个接口</b>
      </p>
      <pre v-highlightA><code >import jmespath
from loguru import logger

from tep.client import request


def test_post(faker_ch, url, login):
    # 描述
    logger.info("test post")
    # 数据
    fake = faker_ch
    # 请求
    response = request(
        "post",
        url=url("/api/users"),
        headers=login.jwt_headers,
        json={
            "name": fake.name()
        }
    )
    # 断言
    assert response.status_code &#60; 400
    # 提取
    user_id = jmespath.search("id", response.json())
</code></pre>
      <br />
      <p>
        <b>多个接口--增删改查</b>
      </p>
      <pre v-highlightA><code >import jmespath
from loguru import logger
from tep.client import request


def test(faker_ch, login, url):
    fake = faker_ch
    logger.info("新增")
    nickname = fake.name()
    phone = fake.phone_number()
    response = request(
        "post",
        url=url("/api/users"),
        headers=login.jwt_headers,
        json={
            "nickname": nickname, "phone": phone
        }
    )
    assert response.status_code &#60; 400
    user_id = jmespath.search("id", response.json())
    created_at = jmespath.search("createdAt", response.json())
    updated_at = jmespath.search("updatedAt", response.json())

    logger.info("查询")
    response = request(
        "get",
        url=url("/api/users"),
        headers=login.jwt_headers,
        params={
            "page": 1,
            "perPage": 10,
            "keyword": nickname
        }
    )
    assert response.status_code &#60; 400

    logger.info("修改")
    nickname_new = fake.name()
    phone_new = fake.phone_number()
    response = request(
        "put",
        url=url(f"/api/users/{user_id}"),
        headers=login.jwt_headers,
        json={
            "id": user_id, "createdAt": created_at, "updatedAt": updated_at,
            "phone": phone_new, "nickname": nickname_new
        }
    )
    assert response.status_code &#60; 400
    logger.info(f"用户姓名手机 {nickname} {phone} 修改后 {nickname_new} {phone_new}")

    logger.info("删除")
    response = request(
        "delete",
        url=url(f"/api/users/{user_id}"),
        headers=login.jwt_headers
    )
    assert response.status_code &#60; 400
</code></pre>
      <br />
      <h3>
        <span style="background-color:#FFE500;">请求方法</span>
      </h3>
      <br />
      <p>
        <b>get</b>
      </p>
      <pre v-highlightA><code ># 不带参数
request("get", url=url("/api/xxx"), headers=headers)

# json参数
request("get", url=url("/api/xxx"), headers=headers, params={})

# queryset
request("get", url=url("/api/xxx?a=1&b=2"), headers=headers)

# json转queryset
from urllib.parse import urlencode

query = {}
request("get", url=url("/api/xxx") + "?" + urlencode(query), headers=headers)
</code></pre>
      <br />
      <p>
        <b>post</b>
      </p>
      <pre v-highlightA><code ># json参数
request("post", url=url("/api/xxx"), headers=headers, json={})

# dict参数
request("post", url=url("/api/xxx"), headers=headers, data={})
</code></pre>
      <br />
      <p>
        <b>put</b>
      </p>
      <pre v-highlightA><code >request("put", url=url("/api/xxx"), headers=headers, json={})
</code></pre>
      <br />
      <p>
        <b>delete</b>
      </p>
      <pre v-highlightA><code >request("delete", url=url(f"/api/xxx"), headers=headers)
</code></pre>
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  </div>
</template>

<script>
export default {
  name: "Grammar",
};
</script>

<style lang="scss" scoped>
pre {
  width: 800px;
  margin-top: 10px;
}
</style>
