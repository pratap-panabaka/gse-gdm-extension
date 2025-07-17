# gdm-extension

> [!CAUTION]
>Please note that this extension is experimental and is continously monitored on Arch Linux with gnome-shell ~~v45~~ ~~v46~~ v47.
> Rarely tested on Ubuntu and Debian.
>
>Though this extension is being tested since Dec 2023, In very very rare case there could be a chance of being unable to reach even to TTY. In such a case, a bootable USB is required to remove this extension. So please make sure you have a bootable USB and some experience on how to mount drives and remove files with command line. This gdm-extension installs at 
>```
>/usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm
>```
 
### A gnome-shell extension for customizing GDM Login Screen for GNOME v42 and above.
Customize background colors, images, blur for each monitor upto 4 monitors for GDM Login Screen from the login screen itself.  
Customize Shell themes, Accent Colors, Icon themes, Fonts, Logo, Banner messages for GDM Login Screen from the login screen itself.

### prerequisite packages
1. `zip`
2. `dbus-x11`
3. `systemd-container`

### Installation
```
git clone https://github.com/pratap-panabaka/gse-gdm-extension/
cd gse-gdm-extension
sudo ./install.sh

# Observation: Occassionaly when system is crashed or due to someother system errors, this extension stops working. In such a case you need to run `sudo ./install.sh` again.
```

### Preview of the gdm-extension (pics from Ubuntu 24.04 GDM Login Screen)
![1](https://github.com/user-attachments/assets/cf26b8d2-525f-43f8-909d-593d259011f3)
![2](https://github.com/user-attachments/assets/624c3a96-bc18-4657-a421-8a0b502f9e00)
![3](https://github.com/user-attachments/assets/702e54b4-3019-4f6c-9ee2-f64657a0056b)
![4](https://github.com/user-attachments/assets/7666f91d-e665-49c1-a5cb-108098b1653b)
![5](https://github.com/user-attachments/assets/1b9b2146-610e-4435-8f2f-da507cb854f8)
![6](https://github.com/user-attachments/assets/9240b6a0-cf43-4ba4-bf1c-47e408026fe6)
![7](https://github.com/user-attachments/assets/ca3aca4a-4657-4cf1-8101-810aad2f09e4)
![8](https://github.com/user-attachments/assets/934a67d2-6ba1-42c2-ad74-14dbd1a1460e)
![9](https://github.com/user-attachments/assets/066fcb6c-8560-4cc7-8b88-6ee56d438cc2)
![10](https://github.com/user-attachments/assets/d77cb20d-4a6b-40c7-becb-453f711fd25d)

### Tweaking from GDM Login Screen
1. On the left side topbar, there is a preferences Icon shown. Click on it and it will popup the menu.
2. Based on number of monitors connected, it will popup a menu for all monitors like `Monitor - 1`, `Monitor - 2` upto 4 monitors.
3. For Each monitor you can choose different colors, backgroud image, blur, gradient horizontal and gradient vertical.
4. For Background, you can set primary color and secondary color with gradient horizontal or vertical. 
you have to enter a valid color for example,`#456789`, `blue` etc. You must be careful while entering these as they must be valid colors.
5. Important is that, you have to **hit Enter** when you finish writing something in the entry box.
6. Icon themes are collected from `["/usr/local/share/icons/", "/usr/share/icons"]` directories.
7. Shell themes are collected from `["/usr/local/share/themes/", "/usr/share/themes"]` directories.
8. Accent Colors - For GNOME 47 accent-colors feature added. If you wish to set topbar color with respect to accent-colors
   uncomment the code for `#panel` in this extensions `stylesheet.css` file.
9. Fonts are collected from `["/usr/local/share/fonts", "/usr/share/fonts]` directories.
10. Fonts are filtered by `FontFamilyName` based on font file naming convention and `StyleName` is ignored by this extension.
11. You can choose distribution logo from `["/usr/local/share/pixmaps", "/usr/share/pixmaps]` directories. 
Valid files with names which include "logo" are only shown.
12. You can tweak some system settings from the System Settings menu like tap-to-click, show date, seconds, weekday, 
disable user list, disable restart buttons, show banner message.
13. You can type banner message on the entry box provided. Make sure you **hit Enter** when you finish writing something in the entry box.
14. Optionally you can overrride styling with extensions css file. for example
    ```
    #panel {
      background-color: -st-accent-color;
    }
    ```
    Topbar/Panel color will syncronize with the accent-color now (Note that accent-color is introduced in GNOME 47, so for earlier versions Accent Color option will not be shown in this extensions menu.)

### Hiding the Preferences Icon from GDM Login Screen
Once you enable the extension it is available for regular users too on the Login Screen.
Once you set colors, background, logo, banner message etc, then to prevent tweaking from non sudo users,
you can hide the extension settings button from the topbar by clicking the Hide button at the bottom of popup menu.

### Showing the Prefernces Icon

> [!IMPORTANT] 
> Please note that `gdm` user is named `Debian-gdm` for debian OS. If you are using Debian OS, please replace `gdm` user with `Debian-gdm` where ever applicable in below commands.

If running from tty
```
sudo machinectl shell gdm@ /bin/bash # gdm || Debian-gdm
dconf write /org/gnome/shell/extensions/gdm-extension/hide-gdm-extension-button false
exit
sudo systemctl restart gdm
```

If running from terminal
```
xhost si:localuser:gdm # gdm || Debian-gdm
sudo -u gdm dbus-launch dconf write /org/gnome/shell/extensions/gdm-extension/hide-gdm-extension-button false # gdm || Debian-gdm
xhost -si:localuser:gdm # gdm || Debian-gdm
```

### Known Issue
When you choose to Disable Restart Buttons, the buttons are hidden as expected, but when you toggle the switch, the buttons
are not shown. To sort out this, go to any tty by CTRL+AL+F4 etc and then run
`sudo systemctl restart gdm`.

### Troubleshoot
While customizing colors, gradient, wallpaper, or choosing shell themes or icon themes, if you encounter problems.  

if you want to operate from tty you need `systemd-container` package installed. Some distros ship it by default.  
If you dont have this package, install it first. Then run below commands.

If running from tty
```
sudo machinectl shell gdm@ /bin/bash # gdm || Debian-gdm
dconf read /org/gnome/shell/enabled-extensions # read if you have any other extensions enabled for GDM login screen
dconf reset -f /org/gnome/shell/enabled-extensions # This will reset the key for enabled-extensions
dconf write /org/gnome/shell/enabled-extensions "@as ['gdm-extension@pratap.fastmail.fm']" # enabling the extension
# Also add any other extensions UUID those are enabled(before discovering this extension) for gdm login screen in the above array.
```

If running from terminal
```
xhost si:localuser:gdm # gdm || Debian-gdm
sudo -u gdm dbus-launch dconf read /org/gnome/shell/enabled-extensions # read if you have any other extensions enabled for GDM login screen
sudo -u gdm dbus-launch dconf reset -f /org/gnome/shell/enabled-extensions # This will reset the key for enabled-extensions
sudo -u gdm dbus-launch dconf write /org/gnome/shell/enabled-extensions "@as ['gdm-extension@pratap.fastmail.fm']" # enabling the extension
# Also add any other extensions UUID those are enabled(before discovering this extension) for gdm login screen in the above array.
xhost -si:localuser:gdm # gdm || Debian-gdm
```

### Disabling the extension
Since this is a special extension which runs only on GDM, disabling is not possible as normal extensions.
The best way is to remove the extension. from the downloaded repository, run
`sudo ./uninstall.sh` and to install again, run `sudo ./install.sh`

```
[admin@Xuxa gdm-extension]$ sudo ./uninstall.sh 
[sudo] password for admin: 

~~~~~ gdm-extension is uninstalled ~~~~~

[admin@Xuxa gdm-extension]$ sudo ./install.sh 


	~~~~~~~~~~~~~~~~ gdm-extension ~~~~~~~~~~~~~~~~

	running the script...

	1. gnome-shell version 47 detected
	2. Creating zip file from the directory v-45-46-47
	3. Zip file created
	4. Doing the main stuff

	gdm-extension is installed. You can set below for GDM Login Screen from the login screen itself

	1. icon-theme
	2. shell-theme
	3. fonts
	4. background with color, gradient or image with blur for multi-monitors

	~~~~~~~~~~~~~~~~~~ Thank You ~~~~~~~~~~~~~~~~~~

[admin@Xuxa gdm-extension]$ 
```

### Issues
If you find any issues please raise [here](https://github.com/PRATAP-KUMAR/gdm-extension/issues)

<hr/>

[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=☕&slug=pratap.panabaka&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff)](https://www.buymeacoffee.com/pratap.panabaka)

