import type { Meta, StoryObj } from '@storybook/react';
import Timer from './Timer';

const meta: Meta<typeof Timer> = {
  title: 'UI/Timer',
  component: Timer,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 5 },
      description: '카운트다운 값 (5 -> 4 -> 3 -> 2 -> 1 -> 0)',
    },
    size: {
      control: { type: 'number' },
      description: '타이머 크기 (기본: 100)',
    },
    on: {
      control: { type: 'color' },
      description: '하이라이트 색상',
    },
    off: {
      control: { type: 'color' },
      description: '비활성 색상',
    },
  },
  args: {
    value: 5,
    size: 100,
    on: '#FFBF00',
    off: 'white',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Countdown: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={5} size={80} />
        <span style={{ fontSize: 14, color: '#666' }}>5</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={4} size={80} />
        <span style={{ fontSize: 14, color: '#666' }}>4</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={3} size={80} />
        <span style={{ fontSize: 14, color: '#666' }}>3</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={2} size={80} />
        <span style={{ fontSize: 14, color: '#666' }}>2</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={1} size={80} />
        <span style={{ fontSize: 14, color: '#666' }}>1</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={0} size={80} />
        <span style={{ fontSize: 14, color: '#666' }}>0</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 32,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={3} size={48} />
        <span style={{ fontSize: 12, color: '#666' }}>Small (48px)</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={3} size={100} />
        <span style={{ fontSize: 12, color: '#666' }}>Default (100px)</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={3} size={160} />
        <span style={{ fontSize: 12, color: '#666' }}>Large (160px)</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Timer value={3} size={240} />
        <span style={{ fontSize: 12, color: '#666' }}>XLarge (240px)</span>
      </div>
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 32,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: 16,
          background: '#1a1a1a',
          borderRadius: 8,
        }}
      >
        <Timer value={2} size={100} on="#00FF00" off="#666" />
        <span style={{ fontSize: 12, color: '#aaa' }}>Green on Dark</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: 16,
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #eee',
        }}
      >
        <Timer value={2} size={100} on="#0066FF" off="#ddd" />
        <span style={{ fontSize: 12, color: '#666' }}>Blue on Light</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: 16,
          background: '#2a1a3a',
          borderRadius: 8,
        }}
      >
        <Timer value={2} size={100} on="#FF00FF" off="#444" />
        <span style={{ fontSize: 12, color: '#aaa' }}>Magenta on Purple</span>
      </div>
    </div>
  ),
};
