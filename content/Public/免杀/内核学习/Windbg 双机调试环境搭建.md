# 采用网络配置调试

先在虚拟机里面ping一下 客户机的ip 看是否能ping通。 虚拟机里面最好关闭防火墙。
命令是在虚拟机里面的系统上运行的。 

这里我们称呼 客户机为 **外机**。 虚拟机里面的系统称呼为 **内机**

内机中执行命令

```shell
bcdedit /debug on 
bcdedit /dbgsettings net hostip:外机的ip port:端口 key:abc.def.aaa.ddd 
例子： 
bcdedit /debug on 
bcdedit /dbgsettings net hostip:192.168.0.102 port:55448 key:abc.def.aaa.ddd
```

之后通过调试模式重新启动系统，在 windbg 中通过自己设置的密钥连接到计算机就可以进行操作了。

通过这些指令可以查看当前系统是否处于调试模式，并且能通过 debugtype 区分当前的调试模式是什么。

```shell
>> bcdedit /dbgsettings
操作成功完成。
key                     abc.def.aaa.ddd
debugtype               NET
hostip                  192.168.0.102
port                    55448
dhcp                    Yes
操作成功完成。
```

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20260308163803.png)

# Windbg 调试指南