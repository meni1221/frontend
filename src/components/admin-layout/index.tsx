import { ActionIcon, AppShell, Badge, Box, Button, Group, Tabs, Text, Title, UnstyledButton } from '@mantine/core';
import { ReactNode, useState } from 'react';
import { IconArmchair, IconBrandWhatsapp, IconCalendar, IconChartPie, IconEdit, IconEye, IconFileText, IconHelpCircle, IconListDetails, IconLogout, IconSettings, IconShield, IconUser, IconUsers, IconWorld } from '@tabler/icons-react';
import { WhatsappStatus } from '../../api';
import { uiConfig } from '../../config';
import { AppTab } from '../../data';
import { useComponentLogger } from '../../utils/component-logger';
import { BrandLogo } from '../brand-logo';
import { AppModal } from '../app-modal';
import { HelpCenter } from '../help-center';

type SessionRole = 'HOST' | 'OWNER';

type AdminLayoutProps = {
  activeTab: AppTab;
  children: ReactNode;
  labels: Record<string, string>;
  onLocaleToggle: () => void;
  onLogoClick: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onStartTour?: () => void;
  onTabChange: (tab: AppTab) => void;
  role: SessionRole;
  userDisplayName: string;
  whatsappStatus?: WhatsappStatus;
};

const navItems: Array<{ value: AppTab; icon: ReactNode; labelKey: string; ownerOnly?: boolean; hiddenForOwner?: boolean }> = [
  { value: 'events', icon: <IconCalendar size={uiConfig.icons.nav} />, labelKey: 'events', hiddenForOwner: true },
  { value: 'audience', icon: <IconUsers size={uiConfig.icons.nav} />, labelKey: 'guestsCommunication', hiddenForOwner: true },
  { value: 'seating', icon: <IconArmchair size={uiConfig.icons.nav} />, labelKey: 'seating', hiddenForOwner: true },
  { value: 'invitations', icon: <IconEdit size={uiConfig.icons.nav} />, labelKey: 'invitations', hiddenForOwner: true },
  { value: 'guest', icon: <IconEye size={uiConfig.icons.nav} />, labelKey: 'guestView', hiddenForOwner: true },
  { value: 'whatsapp', icon: <IconBrandWhatsapp size={uiConfig.icons.nav} />, labelKey: 'whatsapp', ownerOnly: true },
  { value: 'system_overview', icon: <IconChartPie size={uiConfig.icons.nav} />, labelKey: 'systemOverview', ownerOnly: true },
  { value: 'owner', icon: <IconShield size={uiConfig.icons.nav} />, labelKey: 'ownerDashboard', ownerOnly: true },
  { value: 'logs', icon: <IconListDetails size={uiConfig.icons.nav} />, labelKey: 'systemLogs', ownerOnly: true },
  { value: 'terms', icon: <IconFileText size={uiConfig.icons.nav} />, labelKey: 'termsTitle' },
  { value: 'settings', icon: <IconSettings size={uiConfig.icons.nav} />, labelKey: 'settings' },
];

const mobileMainTabs: AppTab[] = ['events', 'audience', 'invitations', 'seating', 'settings'];
const ownerMobileMainTabs: AppTab[] = ['system_overview', 'owner', 'whatsapp', 'logs', 'settings'];

export const AdminLayout = ({
  activeTab,
  children,
  labels,
  onLocaleToggle,
  onLogoClick,
  onLogout,
  onProfileClick,
  onStartTour,
  onTabChange,
  role,
  userDisplayName,
  whatsappStatus = 'DISCONNECTED',
}: AdminLayoutProps) => {
  useComponentLogger('AdminLayout', { activeTab, role });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const visibleNavItems = navItems.filter((item) => {
    if (item.ownerOnly && role !== 'OWNER') {
      return false;
    }

    if (item.hiddenForOwner && role === 'OWNER') {
      return false;
    }

    return true;
  });
  const mobileTabs = role === 'OWNER' ? ownerMobileMainTabs : mobileMainTabs;
  const mobileNavItems = visibleNavItems.filter((item) => mobileTabs.includes(item.value));
  const isWhatsappConnected = whatsappStatus === 'CONNECTED';
  const whatsappStatusLabel = isWhatsappConnected ? labels.connected : labels.disconnected;

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    onLogout();
  };

  return (
    <AppShell
      className="appShell"
      header={{ height: 76 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: true } }}
      padding="lg"
    >
      <AppShell.Header>
        <Group className="topBar" h="100%" px="lg" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <UnstyledButton onClick={onLogoClick} aria-label={labels.appName} className="brandLogoButton">
              <BrandLogo size="header" />
            </UnstyledButton>
            <Box>
              <Title order={4}>{labels.workspace}</Title>
            </Box>
          </Group>

          <Group className="topActions" gap="xs" wrap="nowrap">
            <Badge
              className="whatsappStatusBadge"
              color={isWhatsappConnected ? 'green' : 'red'}
              leftSection={<IconBrandWhatsapp size={uiConfig.icons.button} />}
              title={`${labels.whatsapp}: ${whatsappStatusLabel}`}
              variant="light"
            >
              {whatsappStatusLabel}
            </Badge>
            <ActionIcon variant="light" size="lg" onClick={onLocaleToggle} aria-label="Language">
              <IconWorld size={uiConfig.icons.nav} />
            </ActionIcon>
            <ActionIcon variant="light" size="lg" onClick={() => setIsHelpOpen(true)} aria-label={labels.helpCenter}>
              <IconHelpCircle size={uiConfig.icons.nav} />
            </ActionIcon>
            <Button
              className="userButton"
              variant="light"
              size="sm"
              leftSection={<IconUser size={uiConfig.icons.button} />}
              onClick={onProfileClick}
              title={userDisplayName}
            >
              <Text className="userButtonLabel" size="sm" fw={800}>
                {userDisplayName}
              </Text>
            </Button>
            <ActionIcon variant="light" color="red" size="lg" onClick={() => setIsLogoutModalOpen(true)} aria-label={labels.logout}>
              <IconLogout size={uiConfig.icons.nav} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className="sideNav">
        <Tabs value={activeTab} onChange={(value) => value && onTabChange(value as AppTab)} orientation="vertical" variant="pills">
          <Tabs.List>
            {visibleNavItems.map((item) => (
              <Tabs.Tab
                key={item.value}
                value={item.value}
                leftSection={item.icon}
              >
                {labels[item.labelKey]}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </AppShell.Navbar>

      <AppShell.Main className="mainCanvas">{children}</AppShell.Main>

      <Box className="mobileNav">
        {mobileNavItems.map((item) => (
          <UnstyledButton
            key={item.value}
            className={activeTab === item.value ? 'mobileNavItem active' : 'mobileNavItem'}
            onClick={() => onTabChange(item.value)}
          >
            {item.icon}
            <Text size="xs" fw={700}>{labels[item.labelKey]}</Text>
          </UnstyledButton>
        ))}
      </Box>

      <AppModal
        opened={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title={labels.logoutTitle}
        description={labels.logoutDescription}
        alertColor="red"
        alertIcon={<IconLogout size={uiConfig.icons.alert} />}
        footer={(
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsLogoutModalOpen(false)}>
              {labels.cancel}
            </Button>
            <Button color="red" leftSection={<IconLogout size={uiConfig.icons.button} />} onClick={confirmLogout}>
              {labels.logout}
            </Button>
          </Group>
        )}
      >
        <Text size="sm" c="dimmed">{labels.logoutDataNotice}</Text>
      </AppModal>

      <HelpCenter labels={labels} opened={isHelpOpen} onClose={() => setIsHelpOpen(false)} onStartTour={role === 'HOST' ? onStartTour : undefined} />
    </AppShell>
  );
};
