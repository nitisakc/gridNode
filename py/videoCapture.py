from threading import Thread
import time
import datetime
import base64
import numpy as np
import cv2
import cv2.aruco as aruco
import math
import json
import requests
from utils import WebcamVideoStream

cap = WebcamVideoStream(src='http://192.168.101.73/', width=1280, height=720).start()
aruco_dict = aruco.Dictionary_get(aruco.DICT_4X4_100)
parameters =  aruco.DetectorParameters_create()

def PolygonArea(c):
	c = c[0]
	c = [(c[0][0], c[0][1]), (c[1][0], c[1][1]), (c[2][0], c[2][1]), (c[3][0], c[3][1])]
	n = len(c) 
	area = 0.0
	for i in range(n):
	    j = (i + 1) % n
	    area += c[i][0] * c[j][1]
	    area -= c[j][0] * c[i][1]
	area = abs(area) / 2.0
	return area

while True:
	frame = cap.read()

	frame = frame[0:720, 0:1280]
	frame = cv2.rotate(frame, rotateCode = 0)

	fh, fw, _ = frame.shape
	cx, cy = int(fw/2), int(fh/2)

	gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
	corners, ids, rejectedImgPoints = aruco.detectMarkers(gray, aruco_dict, parameters=parameters)
	aruco.drawDetectedMarkers(frame, corners, ids)
	
	i = 0
	objs = []
	for corner in corners:
		area = PolygonArea(corner)
		if area > 10:
			xtarget = corner[0][0][0]
			ytarget = corner[0][0][1]
			xlast = corner[0][1][0]
			ylast = corner[0][1][1]

			x = (corner[0][0][0] + corner[0][1][0] + corner[0][2][0] + corner[0][3][0]) / 4
			y = (corner[0][0][1] + corner[0][1][1] + corner[0][2][1] + corner[0][3][1]) / 4

			length = math.sqrt(math.pow(x - cx, 2) + math.pow(y - cy, 2))
			back = 220
			if int(ids[i]) != 999:
				cv2.line(frame, (int(x), int(y)), (int(xtarget), int(ytarget)), (0, 180, 150), 1, 1)
				cv2.line(frame, (cx, cy), (int(x), int(y)), (0, 0, 255), 2, 1)
				cv2.line(frame, (cx, cy- back), (int(x), int(y)), (0, 255, 255), 2, 1)

				degree = math.atan2(ylast-ytarget, xlast-xtarget)
				degree = math.degrees(degree) - 90
				if degree < 0:
					degree = 360 + degree
					
				xh = x - cx
				yh = y - cy
				err = 180 - abs(math.degrees(math.atan2(yh, xh)))
				errBack = 180 - abs(math.degrees(math.atan2(y - cy - back, xh)))
				if yh > 0:
					zone = 'F'
				else:
					zone = 'R'
				obj = [int(ids[i]), int(length), int(degree), int(x-cx), int(y-cy), int(err), zone, int(x), int(y), int(errBack) ]
				
				objs.append(obj)
		i = i + 1

	cv2.imshow('frame',frame)

	if cv2.waitKey(1) & 0xFF == ord('q'):
		break

cv2.destroyAllWindows()