#!/usr/bin/env python
#
# Project: Video Streaming with Flask
# Author: Log0 <im [dot] ckieric [at] gmail [dot] com>
# Date: 2014/12/21
# Website: http://www.chioka.in/
# Description:
# Modified to support streaming out with webcams, and not just raw JPEGs.
# Most of the code credits to Miguel Grinberg, except that I made a small tweak. Thanks!
# Credits: http://blog.miguelgrinberg.com/post/video-streaming-with-flask
#
# Usage:
# 1. Install Python dependencies: cv2, flask. (wish that pip install works like a charm)
# 2. Run "python main.py".
# 3. Navigate the browser to the local webpage.
from flask import Flask, render_template, Response
from flask_cors import CORS, cross_origin
from flask import request
from flask import jsonify
from camera import VideoCamera
import numpy as np
import json
import csv  
import datetime
import os
from csv import DictWriter
import cv2
import pandas as pd
import shutil

app = Flask(__name__)
cors = CORS(app, resources={r"/get_table_data": {"origins": "*"}, r"/save_data": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'
camera = VideoCamera()


def gen(type):
    # time formatting 
    # today = str(datetime.datetime.today())
    # filename = today + '.avi'
    # video_path = os.path.join('./video_output', filename)

    # # camera
    camera.select_type(type)
    # frame_height = int(camera.video.get(3))
    # frame_width = int(camera.video.get(4))

    # out = cv2.VideoWriter(video_path, cv2.VideoWriter_fourcc('M','J','P','G'), 10, (frame_width,frame_height))
    frame_saved_list = []
    while True:
        #timer
        frame = camera.get_frame()
        # out.write(frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

'''Main Page, Mode=None'''
@app.route('/')
def index():
    return render_template('index.html', count=0, conf_level=0)

@app.route('/video_feed')
def video_feed():
    return Response(gen(None),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

'''Pushup page, Mode=pushup'''
@app.route('/pushup', methods = ['GET', 'POST'])
def pushup_index():
    return render_template('index_pushup.html')

@app.route('/video_feed_pushup')
def video_feed_pushup():
    camera.reset()
    return Response(gen(type='pushup'),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


'''Situp page, Mode=situp'''
@app.route('/situp')
def situp_index():
    
    return render_template('index_situp.html')

@app.route('/video_feed_situp')
def video_feed_situp():
    camera.reset()
    return Response(gen(type='situp'),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

'''Pullup page, Mode=pullup'''
@app.route('/pullup')
def pullup_index():
    return render_template('index_pullup.html')

@app.route('/video_feed_pullup')
def video_feed_pullup():
    camera.reset()
    return Response(gen(type='pullup'),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


'''Save data to table'''
@app.route('/save_data', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def save_data():
    # get how many data in database
    df_read = pd.read_csv('./database/database_sportstracker.csv', header=0)
    last_row = len(df_read)

    # get data from FE
    data = request.get_json(force=True)
    record = dict()
    record["nomor"] = last_row+1
    record.update(data)

    header_names = list(record.keys())
    # save
    df = pd.DataFrame(data=[record],columns=header_names)
    df.to_csv('./database/database_sportstracker.csv',mode='a', header=False, index=False)

    #copy file from tmp to folder
    nama = data['nama']
    type = data['type']
    # start_time = data['start_time']
    camera.save_to_video()
    
    src = './video_output/tmp/{}.avi'.format(str(datetime.datetime.today().date()))
    dst = './video_output/' + type + '/' + str(last_row+1) + nama +  '.avi'
    # print(dst)
    shutil.copyfile(src, dst)
    # os.remove(src)

    return Response(response='Data is saved!', status=200)


@app.route('/get_table_data', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def get_table_data():
    with open('./database/database_sportstracker.csv',mode='r') as f_object:
        csv_reader = csv.reader(f_object)
        header = next(csv_reader)


        list_of_dict = []
        for row in csv_reader:
            dict_data = dict()
            for i in range(len(header)):
                dict_data[header[i]] = row[i]
            list_of_dict.append(dict_data)
    
    result = {'data': list_of_dict}
    return result
    

if __name__ == '__main__':
    # app.run(host='0.0.0.0')
    app.run(host='localhost')