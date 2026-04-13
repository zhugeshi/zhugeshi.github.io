+++
title = 'Git 使用笔记'
date = '2026-04-13T15:30:00+08:00'
draft = false
description = '从 Obsidian 随机挑选的一篇文章，用于 Hugo 上传与部署测试。'
tags = ['Git']
categories = ['笔记']
slug = 'git-usage-notes'
+++

本篇文档,(不)完全使用ai编写(笑),用于记录我使用git的一些过程
# 常用Git命令
## 基础命令
- commit
- branch
	在HEAD处创建一个新的分支
	
- merge

```
git merge <branch>                // 将branch合并到当前HEAD指向的分支后,合并后要处理冲突的部分
git status                        // 查看冲突文件
```

- rebase

```
git rebase <branch>               // 将当前分支移植到brach的节点后
```

![image.png|300](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251207210200.png)

- revert && reset

```shell
git reset <branch>/<hash>          // 彻底回撤到上一个分支,当前分支的内容直接删除,本地也没有记录了
git revert <branch>/<hash>         // 撤销当前内容,但是重新提交一次commit,可以推送到远程 
```
## 整理分支
- cherry-pick
	可以让你挑选特定的节点合并到你的分支中

![image.png|700](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251207211734.png)

如果你想要删除远程分支

```shell
# 推荐：删除远程分支
git push origin --delete test

# 然后整理本地的远程分支
git fetch --prune
# 或
git remote prune origin

```
## 远程处理
如果你想要推送当前分支到远程仓库中, 如果远程没有 \<branch\> 分支，你需要创建并推送：
 
```shell
git push -u origin <branch>
```

如果你想要删除远程的某个分支，则可以将一个空分支推送并添加上--delete参数

```shell
git push origin --delete <branch>
```
# 常规远程同步流程
- git init (用于初始化本地仓库)
- git add . (将当前仓库下所有的文件添加到git缓冲区)
- git commit (提交修改,并编写注释commit)
- 在github上新建仓库
- git remote add orgin <仓库地址(https)> (给当前本地git仓库添加一个远程仓库,并取名为origin)
	- **git remote -v 可以显示这一步我们添加的对应远程仓库**
- git push -u origin main (将当前分支和origin/main分支绑定,并推送到远程仓库)
# Git log的使用
- `git log` 默认查看历史提交。
- 常用简化：`git log --oneline`
- 可视化：`git log --graph --oneline --all`
- 可加过滤：`--author`、`--grep`、`--since`、`-- <file>`

```shell
将命令映射一下,可以少敲一点:
git config --global alias.lg "log --oneline --graph --all --decorate"

现在输入以下命令即可:
git lg
```
# Git config配置
可以通过下面的命令来查看git中相关的config配置

```shell
git config list
```
## Git Config 代理配置
```shell
git config --global --get http.proxy
git config --global --get https.proxy
```

这里的命令用来显示git中全局的http和https的代理IP和端口

```shell
git config --global --unset http.proxy
git config --global --unset https.proxy
```

这里的命令用来取消设置
## Git 仓库配置
以下的命令用于显示当前仓库用户名和email地址

```shell
git config user.name
git config user.email
```

设置当前仓库的user.name/user.email

```shell
git config user.email yourEmailName
git config user.name yourName
```

设置当前仓库的user.name/user.email

```shell
git config --global user.name yourName
git config --global user.email yourEmailName
```
# 踩的一些坑
```shell
PS D:\Obsidian\mynote> 
git push fatal: The current branch master has no upstream branch. To push the current branch and set the remote as upstream, use git push --set-upstream origin master To have this happen automatically for branches without a tracking upstream, see 'push.autoSetupRemote' in 'git help config'.
```

这段的意思是当前分支(master)没有远程分支(upstream branch)对应,需要绑定关系才能知道push的是哪个分支

方案一:

```shell
首次进行这个命令
git push --set-upstream(或者-u) origin master

今后只需要即可
git push
```

但是如果远程仓库的名字是origin main,就需要进行映射

```shell
语法是:
git push <远程名> <本地分支>:<远程分支>

所以执行一下命令:
git push --set-upstream(或者-u) origin master:main
```

或者重命名当前本地分支

```shell
重命名
git branch -M main

然后再绑定推送到远程分支:
git push -u origin main
```
