from flask import Flask, request, jsonify
from flask_cors import CORS
from kepconfig import connection, connectivity
import os

app = Flask(__name__)
CORS(app)  # Umożliwia CORS dla frontendu

# Globalna zmienna dla połączenia z Kepware
kepware_server = None

# =============================================================================
# AUTHENTICATION
# =============================================================================

@app.route('/api/login', methods=['POST'])
def login():
    """Logowanie do Kepware i inicjalizacja połączenia"""
    global kepware_server
    
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        host = data.get('kepwareHost', 'localhost')
        port = int(data.get('port', 57412))
        
        # Utworzenie połączenia z Kepware
        kepware_server = connection.server(
            host=host,
            port=port,
            user=username,
            pw=password
        )
        
        # Test połączenia - sprawdzenie czy działa
        try:
            connectivity.channel.get_all_channels(kepware_server)
            return jsonify({'success': True, 'token': 'kepware-token', 'message': 'Połączono z Kepware'})
        except Exception as e:
            kepware_server = None
            return jsonify({'success': False, 'message': f'Błąd połączenia: {str(e)}'}), 401
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# =============================================================================
# CHANNELS
# =============================================================================

@app.route('/api/channels', methods=['GET'])
def get_channels():
    """Pobierz wszystkie channele"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        channels = connectivity.channel.get_all_channels(kepware_server)
        
        # Przekształć dane z Kepware do formatu frontendu
        result = []
        for ch in channels:
            result.append({
                'id': ch.get('common.ALLTYPES_NAME'),
                'name': ch.get('common.ALLTYPES_NAME'),
                'driver': ch.get('servermain.MULTIPLE_TYPES_DEVICE_DRIVER'),
                'port': ch.get('servermain.CHANNEL_ETHERNET_COMMUNICATIONS_PORT', 502),
                'timeout': ch.get('servermain.CHANNEL_WRITE_OPTIMIZATIONS_DUTY_CYCLE', 5000)
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels', methods=['POST'])
def add_channel():
    """Dodaj nowy channel"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        data = request.json
        
        # Przygotuj dane channela dla Kepware
        channel_data = {
            'common.ALLTYPES_NAME': data['name'],
            'servermain.MULTIPLE_TYPES_DEVICE_DRIVER': data['driver']
        }
        
        # Dodatkowe parametry jeśli są
        if 'port' in data:
            channel_data['servermain.CHANNEL_ETHERNET_COMMUNICATIONS_PORT'] = data['port']
        if 'timeout' in data:
            channel_data['servermain.CHANNEL_WRITE_OPTIMIZATIONS_DUTY_CYCLE'] = data['timeout']
        
        result = connectivity.channel.add_channel(kepware_server, channel_data)
        
        return jsonify({'success': True, 'id': data['name'], 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>', methods=['PUT'])
def update_channel(channel_name):
    """Aktualizuj channel"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        data = request.json
        
        # Przygotuj dane do aktualizacji
        update_data = {}
        
        if 'name' in data and data['name'] != channel_name:
            update_data['common.ALLTYPES_NAME'] = data['name']
        if 'driver' in data:
            update_data['servermain.MULTIPLE_TYPES_DEVICE_DRIVER'] = data['driver']
        if 'port' in data:
            update_data['servermain.CHANNEL_ETHERNET_COMMUNICATIONS_PORT'] = data['port']
        if 'timeout' in data:
            update_data['servermain.CHANNEL_WRITE_OPTIMIZATIONS_DUTY_CYCLE'] = data['timeout']
        
        result = connectivity.channel.modify_channel(kepware_server, channel_name, update_data)
        
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>', methods=['DELETE'])
def delete_channel(channel_name):
    """Usuń channel"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        result = connectivity.channel.del_channel(kepware_server, channel_name)
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# DEVICES
# =============================================================================

@app.route('/api/channels/<channel_name>/devices', methods=['GET'])
def get_devices(channel_name):
    """Pobierz wszystkie devices z channela"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        devices = connectivity.device.get_all_devices(kepware_server, channel_name)
        
        result = []
        for dev in devices:
            result.append({
                'id': dev.get('common.ALLTYPES_NAME'),
                'name': dev.get('common.ALLTYPES_NAME'),
                'ip': dev.get('servermain.DEVICE_ID_STRING', '').split(',')[0] if ',' in dev.get('servermain.DEVICE_ID_STRING', '') else dev.get('servermain.DEVICE_ID_STRING', ''),
                'slaveId': int(dev.get('servermain.DEVICE_ID_STRING', '1').split(',')[-1]) if ',' in dev.get('servermain.DEVICE_ID_STRING', '') else 1,
                'model': dev.get('servermain.DEVICE_MODEL', 0)
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>/devices', methods=['POST'])
def add_device(channel_name):
    """Dodaj nowy device"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        data = request.json
        
        # Dla Modbus, ID string to: IP,port,SlaveID
        device_id_string = f"{data['ip']},502,{data['slaveId']}"
        
        device_data = {
            'common.ALLTYPES_NAME': data['name'],
            'servermain.DEVICE_ID_STRING': device_id_string,
            'servermain.DEVICE_MODEL': data.get('model', 0)
        }
        
        result = connectivity.device.add_device(kepware_server, channel_name, device_data)
        
        return jsonify({'success': True, 'id': data['name'], 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>/devices/<device_name>', methods=['PUT'])
def update_device(channel_name, device_name):
    """Aktualizuj device"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        data = request.json
        
        update_data = {}
        
        if 'name' in data and data['name'] != device_name:
            update_data['common.ALLTYPES_NAME'] = data['name']
        
        if 'ip' in data or 'slaveId' in data:
            # Odczytaj aktualne dane jeśli brakuje
            current_device = connectivity.device.get_device(kepware_server, f"{channel_name}.{device_name}")
            current_id = current_device.get('servermain.DEVICE_ID_STRING', '192.168.1.1,502,1')
            parts = current_id.split(',')
            
            ip = data.get('ip', parts[0])
            port = parts[1] if len(parts) > 1 else '502'
            slave_id = data.get('slaveId', int(parts[2]) if len(parts) > 2 else 1)
            
            update_data['servermain.DEVICE_ID_STRING'] = f"{ip},{port},{slave_id}"
        
        if 'model' in data:
            update_data['servermain.DEVICE_MODEL'] = data['model']
        
        device_path = f"{channel_name}.{device_name}"
        result = connectivity.device.modify_device(kepware_server, device_path, update_data)
        
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>/devices/<device_name>', methods=['DELETE'])
def delete_device(channel_name, device_name):
    """Usuń device"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        device_path = f"{channel_name}.{device_name}"
        result = connectivity.device.del_device(kepware_server, device_path)
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# TAG GROUPS
# =============================================================================

@app.route('/api/channels/<channel_name>/devices/<device_name>/taggroups', methods=['GET'])
def get_tag_groups(channel_name, device_name):
    """Pobierz wszystkie tag groups"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        device_path = f"{channel_name}.{device_name}"
        tag_groups = connectivity.tag.get_all_tag_groups(kepware_server, device_path)
        
        result = []
        for tg in tag_groups:
            result.append({
                'id': tg.get('common.ALLTYPES_NAME'),
                'name': tg.get('common.ALLTYPES_NAME')
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>/devices/<device_name>/taggroups', methods=['POST'])
def add_tag_group(channel_name, device_name):
    """Dodaj nową tag group"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        data = request.json
        device_path = f"{channel_name}.{device_name}"
        
        tag_group_data = {
            'common.ALLTYPES_NAME': data['name']
        }
        
        result = connectivity.tag.add_tag_group(kepware_server, device_path, tag_group_data)
        
        return jsonify({'success': True, 'id': data['name'], 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>/devices/<device_name>/taggroups/<group_name>', methods=['DELETE'])
def delete_tag_group(channel_name, device_name, group_name):
    """Usuń tag group"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        tag_group_path = f"{channel_name}.{device_name}.{group_name}"
        result = connectivity.tag.del_tag_group(kepware_server, tag_group_path)
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# TAGS
# =============================================================================

@app.route('/api/channels/<channel_name>/devices/<device_name>/taggroups/<group_name>/tags', methods=['GET'])
def get_tags(channel_name, device_name, group_name):
    """Pobierz wszystkie tagi z grupy"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        tag_path = f"{channel_name}.{device_name}.{group_name}"
        tags = connectivity.tag.get_all_tags(kepware_server, tag_path)
        
        result = []
        for t in tags:
            result.append({
                'id': t.get('common.ALLTYPES_NAME'),
                'name': t.get('common.ALLTYPES_NAME'),
                'address': t.get('servermain.TAG_ADDRESS'),
                'dataType': t.get('servermain.TAG_DATA_TYPE', 2)  # 2 = Word
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>/devices/<device_name>/taggroups/<group_name>/tags', methods=['POST'])
def add_tag(channel_name, device_name, group_name):
    """Dodaj nowy tag"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        data = request.json
        tag_path = f"{channel_name}.{device_name}.{group_name}"
        
        # Mapowanie typów danych
        data_type_map = {
            'Word': 2,
            'DWord': 5,
            'Float': 8,
            'Short': 3,
            'Long': 7,
            'Boolean': 1,
            'String': 9
        }
        
        tag_data = {
            'common.ALLTYPES_NAME': data['name'],
            'servermain.TAG_ADDRESS': data['address'],
            'servermain.TAG_DATA_TYPE': data_type_map.get(data.get('dataType', 'Word'), 2)
        }
        
        result = connectivity.tag.add_tag(kepware_server, tag_path, tag_data)
        
        return jsonify({'success': True, 'id': data['name'], 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>/devices/<device_name>/taggroups/<group_name>/tags/<tag_name>', methods=['PUT'])
def update_tag(channel_name, device_name, group_name, tag_name):
    """Aktualizuj tag"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        data = request.json
        
        # Mapowanie typów danych
        data_type_map = {
            'Word': 2,
            'DWord': 5,
            'Float': 8,
            'Short': 3,
            'Long': 7,
            'Boolean': 1,
            'String': 9
        }
        
        update_data = {}
        
        if 'name' in data and data['name'] != tag_name:
            update_data['common.ALLTYPES_NAME'] = data['name']
        if 'address' in data:
            update_data['servermain.TAG_ADDRESS'] = data['address']
        if 'dataType' in data:
            update_data['servermain.TAG_DATA_TYPE'] = data_type_map.get(data['dataType'], 2)
        
        tag_path = f"{channel_name}.{device_name}.{group_name}.{tag_name}"
        result = connectivity.tag.modify_tag(kepware_server, tag_path, update_data)
        
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/channels/<channel_name>/devices/<device_name>/taggroups/<group_name>/tags/<tag_name>', methods=['DELETE'])
def delete_tag(channel_name, device_name, group_name, tag_name):
    """Usuń tag"""
    if not kepware_server:
        return jsonify({'error': 'Brak połączenia z Kepware'}), 401
    
    try:
        tag_path = f"{channel_name}.{device_name}.{group_name}.{tag_name}"
        result = connectivity.tag.del_tag(kepware_server, tag_path)
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.route('/api/health', methods=['GET'])
def health():
    """Sprawdź status API"""
    return jsonify({
        'status': 'running',
        'kepware_connected': kepware_server is not None
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
