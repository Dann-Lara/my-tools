import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelEntity } from './channel.entity';

export enum MonetizationCategory {
  YPP = 'ypp',
  ADS_CONFIG = 'ads_config',
  CONTENT_POLICY = 'content_policy',
  SEO = 'seo',
  AFFILIATE = 'affiliate',
  OWNED_PRODUCT = 'owned_product',
}

export enum StepPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
}

export interface MonetizationStep {
  id: string;
  category: MonetizationCategory;
  title: string;
  description: string;
  actionUrl?: string | null;
  completed: boolean;
  completedAt: Date | null;
  priority: StepPriority;
}

export const DEFAULT_MONETIZATION_STEPS: MonetizationStep[] = [
  // YPP
  { id: 'ypp-1', category: MonetizationCategory.YPP, priority: StepPriority.CRITICAL, title: 'Crear y vincular cuenta de Google AdSense', description: 'YouTube Studio > Monetización > Comenzar. Requiere cuenta bancaria y verificación de identidad.', actionUrl: 'https://studio.youtube.com/channel/monetization', completed: false, completedAt: null },
  { id: 'ypp-2', category: MonetizationCategory.YPP, priority: StepPriority.CRITICAL, title: 'Verificar que el país del canal sea elegible para YPP', description: 'El YPP no está disponible en todos los países.', actionUrl: 'https://support.google.com/youtube/answer/7101720', completed: false, completedAt: null },
  { id: 'ypp-3', category: MonetizationCategory.YPP, priority: StepPriority.CRITICAL, title: 'Activar verificación en dos pasos en Google', description: 'Requisito obligatorio de YouTube para acceder al YPP.', actionUrl: 'https://myaccount.google.com/security', completed: false, completedAt: null },
  // Ads Config
  { id: 'ads-1', category: MonetizationCategory.ADS_CONFIG, priority: StepPriority.CRITICAL, title: 'Activar monetización en cada video', description: 'YouTube Studio > Contenido > video > Monetización > activar toggle.', actionUrl: 'https://studio.youtube.com/channel/content', completed: false, completedAt: null },
  { id: 'ads-2', category: MonetizationCategory.ADS_CONFIG, priority: StepPriority.CRITICAL, title: 'Habilitar todos los formatos de anuncio disponibles', description: 'Pre-roll, Mid-roll, Anuncios de banner y pantalla.', completed: false, completedAt: null },
  { id: 'ads-3', category: MonetizationCategory.ADS_CONFIG, priority: StepPriority.HIGH, title: 'Activar mid-roll automático en videos de más de 8 minutos', description: 'Puede duplicar el RPM en videos de 15+ minutos.', completed: false, completedAt: null },
  { id: 'ads-4', category: MonetizationCategory.ADS_CONFIG, priority: StepPriority.CRITICAL, title: 'Confirmar que "Contenido hecho para niños" está en OFF', description: 'Los videos infantiles no reciben anuncios personalizados por ley.', completed: false, completedAt: null },
  { id: 'ads-5', category: MonetizationCategory.ADS_CONFIG, priority: StepPriority.CRITICAL, title: 'Verificar que no haya claims de copyright antes de publicar', description: 'Un claim puede redirigir el 100% de los ingresos al reclamante.', completed: false, completedAt: null },
  // Content Policy
  { id: 'cp-1', category: MonetizationCategory.CONTENT_POLICY, priority: StepPriority.HIGH, title: 'Usar solo música con licencia libre de derechos', description: 'YouTube Audio Library o Epidemic Sound.', actionUrl: 'https://studio.youtube.com/channel/music', completed: false, completedAt: null },
  { id: 'cp-2', category: MonetizationCategory.CONTENT_POLICY, priority: StepPriority.HIGH, title: 'No usar imágenes o videos con copyright sin permiso', description: 'Usar Pexels, Unsplash, Pixabar o imágenes propias.', completed: false, completedAt: null },
  // SEO
  { id: 'seo-1', category: MonetizationCategory.SEO, priority: StepPriority.MEDIUM, title: 'Apuntar a keywords con CPM estimado >= $5', description: 'Mayor CPM en: finanzas, tecnología, salud, legal.', completed: false, completedAt: null },
  // Affiliate
  { id: 'aff-1', category: MonetizationCategory.AFFILIATE, priority: StepPriority.MEDIUM, title: 'Registrarse en programas de afiliados del nicho', description: 'Amazon Associates, Impact.com o programas directos.', actionUrl: 'https://affiliate-program.amazon.com', completed: false, completedAt: null },
  // Owned Product
  { id: 'prod-1', category: MonetizationCategory.OWNED_PRODUCT, priority: StepPriority.MEDIUM, title: 'Crear un lead magnet o recurso gratuito', description: 'Un PDF, plantilla o checklist gratuito construye la lista de email.', completed: false, completedAt: null },
];

@Entity('youtube_monetization_setup')
export class MonetizationSetupEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  channelId!: string;

  @ManyToOne(() => ChannelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel!: ChannelEntity;

  @Column({ type: 'jsonb', default: DEFAULT_MONETIZATION_STEPS })
  steps!: MonetizationStep[];

  @Column({ nullable: true })
  completedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
