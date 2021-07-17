---
layout: post
title: Thoughts on Zoom Rooms NDI
---

I tried out zoom rooms NDI support

![OBS showing NDI feeds from Zoom Rooms](https://artifact.thepatrick.io/slack/zoom-ndi-obs.png)

What's nice:

* Seperate audio, including stereo when the other end send sit (e.g. with original audio turned on)
* Actual resolution video - the camera on the zoom rooms machine was 1080p, the "remote" was 720p, and the screen share was whatever its real resolution was
* You get to pick what each NDI output is

What's meh:

* Only 3 NDI outputs
* You can pick an individual, a screen share, "Active Talker" or none. This might be because I had two participants though.
* Zoom Rooms requires a dedicated machine (it's designed for conference rooms, so I guess that's expected), and with a mac that means running the controller (what's being screen shared in) on a seperate device (although they have a web based one)
