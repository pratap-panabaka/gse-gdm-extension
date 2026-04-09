# gdm-extension

> [!CAUTION]
> This extension is **experimental** and primarily tested on Arch Linux with GNOME Shell v42 and v49. It has been rarely tested on Ubuntu and Debian.  
>
> Although development has been ongoing since Dec 2023, in very rare cases, installing or using this extension could make it impossible to reach even TTY. In such a scenario, a **bootable USB** is required to remove the extension. Ensure you have a bootable USB and some experience mounting drives and removing files via the command line.  
>
> This extension installs at:
> ```
> /usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm
> ```

> [!WARNING]
> 1. This extension assumes that **no other GNOME Shell extensions are enabled for the GDM user**.  
> 2. In the installation process via script file, the script will remove any other dconf settings stored for GDM user.
> 3. This script will take care enabling the gdm-extension, you dont need to do anything for the gdm-extension to work.  
> 4. Users are responsible for managing the GDM database and configuring the GDM profile if users have specific requirments other than gdm-extension.
> 5. see [this link](https://help.gnome.org/admin/system-admin-guide/stable/extensions-enable.html.en) for general idea.
> 6. Conflicts with other extensions or manual modifications may lead to **unexpected behavior**.

> [!IMPORTANT]
> On the login screen > sub menus, the data is collected from, for
> 1. bakcgrounds: `['/usr/local/share/backgrounds', '/usr/share/backgrounds']`
> 2. fonts: `['/usr/local/share/fonts', '/usr/share/fonts']`
> 3. icon-themes: `['/usr/local/share/icons', '/usr/share/icons']`
> 4. shell-themes: `['/usr/local/share/themes', '/usr/share/themes']`
> 5. logos: `['/usr/local/share/pixmaps', '/usr/share/pixmaps']`, logo file name must include logo otherwise that is not picked.
> 
> This means, if you have custom `background images`, `fonts`, `icon-themes`, `shell-themes`, `logos`, they must be in above folders and for logo (the small icon at the bottom of GDM screen) the file name must include "logo". Otherwise they are not picked.

---

### Overview
A GNOME Shell extension to **customize the GDM Login Screen** for GNOME v42 and above.  

Features include:  
- Background colors, images, blur for up to 4 monitors.  
- Custom shell themes, accent colors, icon themes, fonts.  
- Customizable logo and banner messages.  
- All changes configurable **directly from the login screen**.

---

### Prerequisite Packages
Ensure the following are installed:  
1. `zip`  
2. `unzip`  
3. `dconf`  
4. `glib-compile-schemas`

---

### Installation
```bash
git clone https://github.com/pratap-panabaka/gse-gdm-extension/
cd gse-gdm-extension
sudo ./install.sh
```

### Hiding/Showing the gdm-extension button on login-screen
1. Open the file
```bash
sudo nano /etc/dconf/db/gdm.d/99-gdm-extension
```

2. Change the key to `true` if you want to hide the button, or `false` to show the button, default is `false`

> [org/gnome/shell/extensions/gdm-extension]  
> hide-gdm-extension-button=true

3. To save the file, Press <kbd>Ctrl+x</kbd>, <kbd>y</kbd>, <kbd>Enter</kbd>

4. Update dconf database
```bash
sudo dconf update
```

### Uninstall
```bash
sudo ./uninstall.sh
```

### Issues
If you find any issues please raise [here](https://github.com/pratap-panabaka/gse-gdm-extension/issues)

<hr/>

[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=☕&slug=pratap.panabaka&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff)](https://www.buymeacoffee.com/pratap.panabaka)
