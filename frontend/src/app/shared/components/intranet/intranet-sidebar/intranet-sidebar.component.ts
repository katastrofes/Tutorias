import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';
import { Subscription, of } from 'rxjs';
import { SidebarService } from '../../../services/sidebar.service';

type ChildItem = {
  name: string;
  path: string;
  new?: boolean;
};

type SubItem = {
  name: string;
  path?: string;
  pro?: boolean;
  new?: boolean;
  hasChildren?: boolean;
  children?: ChildItem[];
};

type NavItem = {
  name: string;
  icon: string;
  path?: string;
  new?: boolean;
  disabled?: boolean;
  subItems?: SubItem[];
};

@Component({
  selector: 'app-intranet-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe,
  ],
  templateUrl: './intranet-sidebar.component.html',
})
export class IntranetSidebarComponent implements OnInit {

  // Variables para controlar submenús de tercer nivel
  openChildMenu: string | null = null;
  childMenuHeights: { [key: string]: number } = {};

  // Variables existentes
  openSubmenu: string | null = null;
  subMenuHeights: { [key: string]: number } = {};

  // Main nav items (estudiante) - items estáticos
  navItems: NavItem[] = [
    { icon: `📚`, name: "Registro Curricular", disabled: true },
    { icon: `🏫`, name: "Docencia Académica", disabled: true },
    { icon: `👨‍🏫`, name: "Tutoría Académica", disabled: true },
    { icon: `🎁`, name: "Beneficios DAE", disabled: true },
    { icon: `👨‍🎓`, name: "Ayudante Alumno", disabled: true },
    { icon: `💰`, name: "Estudiante Financiero", disabled: true }
  ];
    
  // Others nav items (tutor) - con tres niveles
  othersItems: NavItem[] = [
    {
      icon: `📊`,
      name: "Gestión Tutor",
      subItems: [
        { 
          name: "2025 Semestre 2", 
          hasChildren: true,
          children: [
            { name: "INGENIERIA QUÍMICA AMBIENTAL", path: "/intranet/tutor/2025/2/1/60/sesiones" }
          ]
        },
      ]
    }
  ];

  // Para mantener el sidebar siempre expandido
  readonly isExpanded$ = of(true);
  readonly isMobileOpen$ = of(true);
  readonly isHovered$ = of(false);

  private subscription: Subscription = new Subscription();

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Suscribirse a eventos del router
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    // Carga inicial
    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  // Para submenús de segundo nivel
  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Para submenús de tercer nivel (children)
  toggleChildMenu(section: string, parentIndex: number, childIndex: number) {
    const key = `${section}-${parentIndex}-${childIndex}`;
    
    if (this.openChildMenu === key) {
      this.openChildMenu = null;
      this.childMenuHeights[key] = 0;
    } else {
      this.openChildMenu = key;
      
      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.childMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [
      { items: this.navItems, prefix: 'main' },
      { items: this.othersItems, prefix: 'others' },
    ];

    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem, j) => {
            // Revisar si la ruta actual está en los children
            if (subItem.children) {
              subItem.children.forEach(child => {
                if (currentUrl === child.path) {
                  // Abrir el submenú principal
                  const mainKey = `${group.prefix}-${i}`;
                  this.openSubmenu = mainKey;
                  
                  // Abrir el child menu
                  const childKey = `${group.prefix}-${i}-${j}`;
                  this.openChildMenu = childKey;

                  setTimeout(() => {
                    const mainEl = document.getElementById(mainKey);
                    const childEl = document.getElementById(childKey);
                    
                    if (mainEl) {
                      this.subMenuHeights[mainKey] = mainEl.scrollHeight;
                    }
                    
                    if (childEl) {
                      this.childMenuHeights[childKey] = childEl.scrollHeight;
                    }
                    
                    this.cdr.detectChanges();
                  });
                }
              });
            }
            
            // También revisar si la ruta está en el subItem directo
            if (subItem.path && currentUrl === subItem.path) {
              const key = `${group.prefix}-${i}`;
              this.openSubmenu = key;

              setTimeout(() => {
                const el = document.getElementById(key);
                if (el) {
                  this.subMenuHeights[key] = el.scrollHeight;
                  this.cdr.detectChanges();
                }
              });
            }
          });
        }
      });
    });
  }

  onSubmenuClick() {
    // Cerrar sidebar en móvil si está abierto
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }
}
