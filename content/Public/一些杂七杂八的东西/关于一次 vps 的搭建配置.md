# 目标与最终架构

这次配置的目标，是购买一台海外 VPS，并将其作为个人服务器使用，似乎还有一些神秘的作用（大雾）。

最后采用了下面的配置：

* 服务端：Ubuntu VPS
* 代理核心：sing-box
* 协议：Shadowsocks 2022
* 客户端：Clash Verge / Mihomo
* 代理端口：TCP + UDP 443
* 分流模式：Rule
* 国内流量：DIRECT
* 指定国外服务：通过美国 VPS
* WireGuard：保留配置，但暂时关闭

最终网络结构大致如下：

```text
                    ┌──── 国内网站 / 普通流量
                    │
                    │         DIRECT
                    │            │
电脑 / Clash Verge ─┤            ▼
                    │         本地网络
                    │
                    │
                    └──── ChatGPT / Google / YouTube 等
                              │
                              ▼
                      Shadowsocks 2022
                              │
                              ▼
                        美国 VPS :443
                              │
                              ▼
                           Internet
```

这种方式最大的优点，是可以利用 Clash/Mihomo 的规则系统，只让真正需要代理的流量经过 VPS，从而减少 VPS 流量消耗（其实我也不是很懂）

# 配置过程

首先进行系统更新

```bash
apt update
apt upgrade -y
```

为我的 vps 搭配 ssh 密钥登录。
刚开始查询的时候发现当前 vps 禁止 ssh 密钥对，编辑文件打开即可

```shell
root@VM-qGcZ14MraO:~/.ssh# sshd -T | grep -E 'pubkeyauthentication|authorizedkeysfile|permitrootlogin'
permitrootlogin yes
pubkeyauthentication no
authorizedkeysfile .ssh/authorized_keys .ssh/authorized_keys2

# => after

root@VM-qGcZ14MraO:~/.ssh# sshd -T | grep -E 'pubkeyauthentication|authorizedkeysfile|permitrootlogin'
permitrootlogin yes
pubkeyauthentication yes
authorizedkeysfile .ssh/authorized_keys .ssh/authorized_keys2
```

在主机上生成密钥对

```shell
# -t 使用的算法
# -C 使用的名称
# -f 保存的路径
ssh-keygen -t ed25519 -C "my-vps" -f ~/.ssh/id_ed25519_myvps
```

接下来通过密码正常通过 ssh 进入 vps，创建相关目录。
把本地 `.pub` 文件中的完整公钥粘进去并保存。然后设置权限：

```shell
mkdir -p /root/.ssh
chmod 700 /root/.ssh
vim /root/.ssh/authorized_keys

# 复制你的公钥到 authorized_keys 中

chmod 600 /root/.ssh/authorized_keys 
chown -R root:root /root/.ssh
```

主机上验证，并配置 ssh config。

```shell
ssh -i "$HOME\.ssh\id_ed25519_myvps" root@YOUR_VPS_IP

C:\Users\你的用户名\.ssh\config

Host myvps 
	HostName YOUR_VPS_IP 
	User root 
	IdentityFile ~/.ssh/id_ed25519_myvps 
	IdentitiesOnly yes
```

# 安装 sing-box

安装 sing-box，并检查 443 是否已经被占用

```bash
curl -fsSL https://sing-box.app/install.sh | sh

ss -lntup | grep ':443 '
```

如果没有输出，就可以让 sing-box 使用 TCP/UDP 443。之后生成 Shadowsocks 密钥，建立目录：

```bash
mkdir -p /etc/sing-box
chmod 700 /etc/sing-box
```

生成 16 字节 Base64 密钥，并设置权限

```bash
sing-box generate rand --base64 16 \
  > /root/ss-password.txt
  
chmod 600 /root/ss-password.txt
```

读取密码：

```bash
SS_PASSWORD=$(cat /root/ss-password.txt)

vim /etc/sing-box/config.json

# 写入以下配置
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "inbounds": [
    {
      "type": "shadowsocks",
      "tag": "ss-in",
      "listen": "::",
      "listen_port": 443,
      "method": "2022-blake3-aes-128-gcm",
      "password": "YOUR_SS_PASSWORD"
    }
  ]
}

chmod 600 /etc/sing-box/config.json
```

设置开机启动：

```bash
systemctl enable sing-box
```

启动或重启：

```bash
systemctl restart sing-box
```

查看状态：

```bash
systemctl status sing-box --no-pager -l
```

正常结果类似：

```text
Active: active (running)
```

日志：

```text
INFO inbound/shadowsocks[ss-in]:
tcp server started at [::]:443

INFO inbound/shadowsocks[ss-in]:
udp server started at [::]:443

INFO sing-box started
```

说明 udp 和 tcp 全部成功启动。进一步确认：

```bash
ss -lntup | grep ':443'

# output =>
# udp UNCONN ... *:443 ... sing-box
# tcp LISTEN ... *:443 ... sing-box
```

到这里，VPS 服务端已经配置完成。接下来自己配置一些文件接入第三方客户端就可以了，这里就不多说了。

# 服务器流量监控

查看本月：

```bash
vnstat -m -i eth0
```

查看每天：

```bash
vnstat -d -i eth0
```

查看每小时：

```bash
vnstat -h -i eth0
```

实时：

```bash
vnstat -l -i eth0
```

输出中：

```text
rx
```

表示 VPS 收到的流量。

```text
tx
```

表示 VPS 发出的流量。

```text
total
```