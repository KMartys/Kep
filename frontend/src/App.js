import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Save, X, List, Cpu, Folder, Tag as TagIcon } from 'lucide-react';

// Mock API - w produkcji zastąp prawdziwym backendem z Kepware SDK
const mockAPI = {
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, token: 'mock-token' };
  },
  getChannels: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'ch1', name: 'Modbus_Channel_1', driver: 'Modbus TCP/IP', port: 502, timeout: 5000 },
      { id: 'ch2', name: 'Modbus_Channel_2', driver: 'Modbus TCP/IP', port: 502, timeout: 3000 }
    ];
  },
  getDevices: async (channelId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'dev1', name: 'Device_1', ip: '192.168.1.100', slaveId: 1, model: 0 },
      { id: 'dev2', name: 'Device_2', ip: '192.168.1.101', slaveId: 2, model: 0 }
    ];
  },
  getTagGroups: async (channelId, deviceId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'tg1', name: 'Sensors' },
      { id: 'tg2', name: 'Actuators' }
    ];
  },
  getTags: async (channelId, deviceId, tagGroupId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'tag1', name: 'Temperature_01', address: '40001', dataType: 'Float' },
      { id: 'tag2', name: 'Pressure_01', address: '40003', dataType: 'Word' }
    ];
  },
  saveChannel: async (channel) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id: channel.id || 'ch' + Date.now() };
  },
  saveDevice: async (channelId, device) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id: device.id || 'dev' + Date.now() };
  },
  saveTagGroup: async (channelId, deviceId, tagGroup) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id: tagGroup.id || 'tg' + Date.now() };
  },
  saveTag: async (channelId, deviceId, tagGroupId, tag) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id: tag.id || 'tag' + Date.now() };
  },
  deleteChannel: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
  deleteDevice: async (channelId, deviceId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
  deleteTagGroup: async (channelId, deviceId, tagGroupId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
  deleteTag: async (channelId, deviceId, tagGroupId, tagId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  }
};

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    kepwareHost: 'localhost'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!credentials.username || !credentials.password) {
      alert('Wypełnij wszystkie pola');
      return;
    }
    setLoading(true);
    try {
      const result = await mockAPI.login(credentials);
      if (result.success) {
        onLogin(result.token);
      }
    } catch (error) {
      alert('Błąd logowania: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Settings className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Kepware Config Manager</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kepware Host</label>
            <input
              type="text"
              value={credentials.kepwareHost}
              onChange={(e) => setCredentials({...credentials, kepwareHost: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Łączenie...' : 'Zaloguj'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChannelForm = ({ channel, onSave, onCancel }) => {
  const [formData, setFormData] = useState(channel || {
    name: '',
    driver: 'Modbus TCP/IP',
    port: 502,
    timeout: 5000,
    retryCount: 3
  });

  const drivers = ['Modbus TCP/IP', 'Modbus RTU', 'Simulator'];

  const handleSubmit = () => {
    if (!formData.name || !formData.driver) {
      alert('Wypełnij wymagane pola');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{channel ? 'Edytuj Channel' : 'Nowy Channel'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa channela</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <select
              value={formData.driver}
              onChange={(e) => setFormData({...formData, driver: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {drivers.map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
              <input
                type="number"
                value={formData.timeout}
                onChange={(e) => setFormData({...formData, timeout: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retry Count</label>
            <input
              type="number"
              value={formData.retryCount}
              onChange={(e) => setFormData({...formData, retryCount: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Zapisz
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeviceForm = ({ device, channelId, onSave, onCancel }) => {
  const [formData, setFormData] = useState(device || {
    name: '',
    ip: '',
    slaveId: 1,
    model: 0
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.ip) {
      alert('Wypełnij wymagane pola');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{device ? 'Edytuj Device' : 'Nowy Device'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa urządzenia</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres IP</label>
            <input
              type="text"
              value={formData.ip}
              onChange={(e) => setFormData({...formData, ip: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="192.168.1.100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slave ID</label>
              <input
                type="number"
                value={formData.slaveId}
                onChange={(e) => setFormData({...formData, slaveId: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
                max="247"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="number"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Zapisz
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TagGroupForm = ({ tagGroup, onSave, onCancel }) => {
  const [formData, setFormData] = useState(tagGroup || {
    name: ''
  });

  const handleSubmit = () => {
    if (!formData.name) {
      alert('Wypełnij nazwę grupy');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{tagGroup ? 'Edytuj Tag Group' : 'Nowa Tag Group'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa grupy</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Zapisz
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TagForm = ({ tag, onSave, onCancel }) => {
  const [formData, setFormData] = useState(tag || {
    name: '',
    address: '',
    dataType: 'Word'
  });

  const dataTypes = ['Word', 'DWord', 'Float', 'Short', 'Long', 'Boolean', 'String'];

  const handleSubmit = () => {
    if (!formData.name || !formData.address) {
      alert('Wypełnij wymagane pola');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{tag ? 'Edytuj Tag' : 'Nowy Tag'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa taga</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres Modbus</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="40001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ danych</label>
            <select
              value={formData.dataType}
              onChange={(e) => setFormData({...formData, dataType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {dataTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Zapisz
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  const [channels, setChannels] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tagGroups, setTagGroups] = useState([]);
  const [tags, setTags] = useState([]);
  
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedTagGroup, setSelectedTagGroup] = useState(null);
  
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [showTagGroupForm, setShowTagGroupForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  
  const [editingChannel, setEditingChannel] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editingTagGroup, setEditingTagGroup] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadDevices(selectedChannel.id);
      setSelectedDevice(null);
      setSelectedTagGroup(null);
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (selectedDevice) {
      loadTagGroups(selectedChannel.id, selectedDevice.id);
      setSelectedTagGroup(null);
    }
  }, [selectedDevice]);

  useEffect(() => {
    if (selectedTagGroup) {
      loadTags(selectedChannel.id, selectedDevice.id, selectedTagGroup.id);
    }
  }, [selectedTagGroup]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const data = await mockAPI.getChannels();
      setChannels(data);
    } catch (error) {
      alert('Błąd ładowania channeli: ' + error.message);
    }
    setLoading(false);
  };

  const loadDevices = async (channelId) => {
    try {
      const data = await mockAPI.getDevices(channelId);
      setDevices(data);
    } catch (error) {
      alert('Błąd ładowania devices: ' + error.message);
    }
  };

  const loadTagGroups = async (channelId, deviceId) => {
    try {
      const data = await mockAPI.getTagGroups(channelId, deviceId);
      setTagGroups(data);
    } catch (error) {
      alert('Błąd ładowania tag groups: ' + error.message);
    }
  };

  const loadTags = async (channelId, deviceId, tagGroupId) => {
    try {
      const data = await mockAPI.getTags(channelId, deviceId, tagGroupId);
      setTags(data);
    } catch (error) {
      alert('Błąd ładowania tagów: ' + error.message);
    }
  };

  const handleSaveChannel = async (channelData) => {
    try {
      await mockAPI.saveChannel(channelData);
      await loadChannels();
      setShowChannelForm(false);
      setEditingChannel(null);
      alert('Channel zapisany pomyślnie');
    } catch (error) {
      alert('Błąd zapisu channela: ' + error.message);
    }
  };

  const handleSaveDevice = async (deviceData) => {
    try {
      await mockAPI.saveDevice(selectedChannel.id, deviceData);
      await loadDevices(selectedChannel.id);
      setShowDeviceForm(false);
      setEditingDevice(null);
      alert('Device zapisany pomyślnie');
    } catch (error) {
      alert('Błąd zapisu device: ' + error.message);
    }
  };

  const handleSaveTagGroup = async (tagGroupData) => {
    try {
      await mockAPI.saveTagGroup(selectedChannel.id, selectedDevice.id, tagGroupData);
      await loadTagGroups(selectedChannel.id, selectedDevice.id);
      setShowTagGroupForm(false);
      setEditingTagGroup(null);
      alert('Tag Group zapisana pomyślnie');
    } catch (error) {
      alert('Błąd zapisu tag group: ' + error.message);
    }
  };

  const handleSaveTag = async (tagData) => {
    try {
      await mockAPI.saveTag(selectedChannel.id, selectedDevice.id, selectedTagGroup.id, tagData);
      await loadTags(selectedChannel.id, selectedDevice.id, selectedTagGroup.id);
      setShowTagForm(false);
      setEditingTag(null);
      alert('Tag zapisany pomyślnie');
    } catch (error) {
      alert('Błąd zapisu taga: ' + error.message);
    }
  };

  const handleDeleteChannel = async (id) => {
    if (confirm('Czy na pewno chcesz usunąć ten channel?')) {
      try {
        await mockAPI.deleteChannel(id);
        await loadChannels();
        if (selectedChannel?.id === id) {
          setSelectedChannel(null);
          setDevices([]);
          setTagGroups([]);
          setTags([]);
        }
        alert('Channel usunięty');
      } catch (error) {
        alert('Błąd usuwania channela: ' + error.message);
      }
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (confirm('Czy na pewno chcesz usunąć to urządzenie?')) {
      try {
        await mockAPI.deleteDevice(selectedChannel.id, deviceId);
        await loadDevices(selectedChannel.id);
        if (selectedDevice?.id === deviceId) {
          setSelectedDevice(null);
          setTagGroups([]);
          setTags([]);
        }
        alert('Device usunięty');
      } catch (error) {
        alert('Błąd usuwania device: ' + error.message);
      }
    }
  };

  const handleDeleteTagGroup = async (tagGroupId) => {
    if (confirm('Czy na pewno chcesz usunąć tę grupę?')) {
      try {
        await mockAPI.deleteTagGroup(selectedChannel.id, selectedDevice.id, tagGroupId);
        await loadTagGroups(selectedChannel.id, selectedDevice.id);
        if (selectedTagGroup?.id === tagGroupId) {
          setSelectedTagGroup(null);
          setTags([]);
        }
        alert('Tag Group usunięta');
      } catch (error) {
        alert('Błąd usuwania tag group: ' + error.message);
      }
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (confirm('Czy na pewno chcesz usunąć ten tag?')) {
      try {
        await mockAPI.deleteTag(selectedChannel.id, selectedDevice.id, selectedTagGroup.id, tagId);
        await loadTags(selectedChannel.id, selectedDevice.id, selectedTagGroup.id);
        alert('Tag usunięty');
      } catch (error) {
        alert('Błąd usuwania taga: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Kepware Config Manager</h1>
          </div>
          <button
            onClick={onLogout}
            className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md transition"
          >
            Wyloguj
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Channels */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <List className="w-5 h-5" />
                Channels
              </h2>
              <button
                onClick={() => {
                  setEditingChannel(null);
                  setShowChannelForm(true);
                }}
                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <p className="text-gray-500 text-center py-4 text-sm">Ładowanie...</p>
            ) : channels.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">Brak channeli</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {channels.map(channel => (
                  <div
                    key={channel.id}
                    className={`p-2 border rounded cursor-pointer transition text-sm ${
                      selectedChannel?.id === channel.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{channel.name}</h3>
                        <p className="text-xs text-gray-600 truncate">{channel.driver}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChannel(channel);
                            setShowChannelForm(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChannel(channel.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Devices */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Devices
              </h2>
              <button
                onClick={() => {
                  if (!selectedChannel) {
                    alert('Wybierz channel');
                    return;
                  }
                  setEditingDevice(null);
                  setShowDeviceForm(true);
                }}
                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400"
                disabled={!selectedChannel}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {!selectedChannel ? (
              <p className="text-gray-500 text-center py-4 text-sm">Wybierz channel</p>
            ) : devices.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">Brak devices</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {devices.map(device => (
                  <div
                    key={device.id}
                    className={`p-2 border rounded cursor-pointer transition text-sm ${
                      selectedDevice?.id === device.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{device.name}</h3>
                        <p className="text-xs text-gray-600">{device.ip} | Slave: {device.slaveId}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDevice(device);
                            setShowDeviceForm(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDevice(device.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tag Groups */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Tag Groups
              </h2>
              <button
                onClick={() => {
                  if (!selectedDevice) {
                    alert('Wybierz device');
                    return;
                  }
                  setEditingTagGroup(null);
                  setShowTagGroupForm(true);
                }}
                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400"
                disabled={!selectedDevice}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {!selectedDevice ? (
              <p className="text-gray-500 text-center py-4 text-sm">Wybierz device</p>
            ) : tagGroups.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">Brak grup</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tagGroups.map(tg => (
                  <div
                    key={tg.id}
                    className={`p-2 border rounded cursor-pointer transition text-sm ${
                      selectedTagGroup?.id === tg.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedTagGroup(tg)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate flex-1">{tg.name}</h3>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTagGroup(tg);
                            setShowTagGroupForm(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTagGroup(tg.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                Tags
              </h2>
              <button
                onClick={() => {
                  if (!selectedTagGroup) {
                    alert('Wybierz tag group');
                    return;
                  }
                  setEditingTag(null);
                  setShowTagForm(true);
                }}
                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400"
                disabled={!selectedTagGroup}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {!selectedTagGroup ? (
              <p className="text-gray-500 text-center py-4 text-sm">Wybierz tag group</p>
            ) : tags.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">Brak tagów</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    className="p-2 border border-gray-300 rounded text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{tag.name}</h3>
                        <p className="text-xs text-gray-600">{tag.address} | {tag.dataType}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => {
                            setEditingTag(tag);
                            setShowTagForm(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showChannelForm && (
        <ChannelForm
          channel={editingChannel}
          onSave={handleSaveChannel}
          onCancel={() => {
            setShowChannelForm(false);
            setEditingChannel(null);
          }}
        />
      )}

      {showDeviceForm && (
        <DeviceForm
          device={editingDevice}
          channelId={selectedChannel?.id}
          onSave={handleSaveDevice}
          onCancel={() => {
            setShowDeviceForm(false);
            setEditingDevice(null);
          }}
        />
      )}

      {showTagGroupForm && (
        <TagGroupForm
          tagGroup={editingTagGroup}
          onSave={handleSaveTagGroup}
          onCancel={() => {
            setShowTagGroupForm(false);
            setEditingTagGroup(null);
          }}
        />
      )}

      {showTagForm && (
        <TagForm
          tag={editingTag}
          onSave={handleSaveTag}
          onCancel={() => {
            setShowTagForm(false);
            setEditingTag(null);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {!isLoggedIn ? (
        <LoginForm onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Dashboard onLogout={() => setIsLoggedIn(false)} />
      )}
    </>
  );
}