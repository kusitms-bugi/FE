import type { Meta, StoryObj } from '@storybook/react';
import { NotificateMessage } from './NotificateMessage';

const meta: Meta<typeof NotificateMessage> = {
  title: 'UI/NotificateMessage',
  component: NotificateMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'fail', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 메시지 (스텝 번호 포함)
export const Default: Story = {
  args: {
    step: 1,
    message: '의자에 편안히 앉아 허리를 펴고 턱을 당겨주세요.',
  },
};

// 에러 단계 (기본 상태 + 에러 메시지)
export const ErrorStep: Story = {
  args: {
    variant: 'default',
    step: 1,
    message: '의자에 편안히 앉아 허리를 펴고 턱을 당겨주세요.',
    errorMessage: '허리를 의자에 더 가까이 다가가주세요.',
  },
};

// 성공 메시지
export const Success: Story = {
  args: {
    variant: 'success',
    message: '의자에 편안히 앉아 허리를 펴고 턱을 당겨주세요.',
  },
};

// 긴 메시지
export const LongMessage: Story = {
  args: {
    variant: 'default',
    message:
      '이것은 매우 긴 메시지입니다. 실제 사용 시에는 사용자에게 중요한 정보를 전달하는 메시지가 들어갈 것입니다. 알림 메시지는 사용자에게 명확하고 간결한 정보를 제공해야 합니다.',
  },
};

// 모든 변형을 보여주는 그리드
export const AllVariants: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <NotificateMessage
        variant="default"
        step={1}
        message="의자에 편안히 앉아 허리를 펴고 턱을 당겨주세요."
      />
      <NotificateMessage
        variant="default"
        step={1}
        message="의자에 편안히 앉아 허리를 펴고 턱을 당겨주세요."
        errorMessage="허리를 의자에 더 가까이 다가가주세요."
      />
      <NotificateMessage
        variant="success"
        step={1}
        message="의자에 편안히 앉아 허리를 펴고 턱을 당겨주세요."
      />
    </div>
  ),
};
