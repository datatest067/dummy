FROM ros:foxy
 
 
RUN apt-get update && apt-get install -y \
      ros-${ROS_DISTRO}-demo-nodes-cpp \
      ros-${ROS_DISTRO}-demo-nodes-py && \
    rm -rf /var/lib/apt/lists/*
RUN mkdir -p /my_ros2_ws/src
WORKDIR /my_ros2_ws/src
COPY my_ros2_ws_1/my_ros2_ws /my_ros2_ws/src
 
WORKDIR /my_ros2_ws
RUN . /opt/ros/foxy/setup.sh && \
    colcon build
 
#WORKDIR /my_ros2_ws
 
RUN . /my_ros2_ws/install/local_setup.sh
 
WORKDIR /my_ros2_ws
 
#CMD ["ros2", "launch", "my_package", "my_nodesub.py"]
#CMD . /my_ros2_ws/install/local_setup.sh && ros2 launch my_package my_nodesub.py
CMD . /my_ros2_ws/install/local_setup.sh && \
    ros2 run my_package my_nodesub || echo "Error: Unable to run the node"
