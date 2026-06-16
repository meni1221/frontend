import { Center, Loader, Stack, Text } from '@mantine/core';

type PageLoaderProps = {
  label?: string;
};

export const PageLoader = ({ label }: PageLoaderProps) => (
  <Center py="xl">
    <Stack align="center" gap="sm">
      <Loader color="ishruGreen" />
      {label && <Text size="sm" c="dimmed">{label}</Text>}
    </Stack>
  </Center>
);
