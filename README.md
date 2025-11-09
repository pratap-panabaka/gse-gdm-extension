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

> [!CAUTION]
> 1. This extension assumes that **no other GNOME Shell extensions are enabled for the GDM user**.  
> 2. In the installation process via script file, the script will remove any other dconf settings stored for GDM user.
> 3. This script will take care enabling the gdm-extension, you dont need to do anything for the gdm-extension to work.  
> 4. Users are responsible for managing the GDM database and configuring the GDM profile if you have specific requirments other than gdm-extension.
> 5. see [this link](https://help.gnome.org/admin/system-admin-guide/stable/extensions-enable.html.en) for general idea.
> 6. Conflicts with other extensions or manual modifications may lead to **unexpected behavior**.

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
sudo ./unistall.sh
```

### Uninstall
```bash
sudo ./install.sh
```
